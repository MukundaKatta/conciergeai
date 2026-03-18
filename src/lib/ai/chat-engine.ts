import { createServiceRoleClient } from "@/lib/supabase/server";
import { generateChatResponse, detectSentiment, summarizeConversation } from "./openai";
import { searchKnowledgeBase, buildKnowledgeContext } from "./knowledge-search";
import { executeAction, ActionType } from "./agent-actions";
import type { Agent, ChatMessage, EscalationRule } from "@/types/database";

interface ChatEngineResponse {
  content: string;
  action_taken?: { type: string; result: Record<string, unknown> };
  should_escalate: boolean;
  escalation_reason?: string;
  escalation_priority?: string;
}

export async function processChatMessage(
  sessionId: string,
  agentId: string,
  userMessage: string,
  previousMessages: ChatMessage[]
): Promise<ChatEngineResponse> {
  const supabase = createServiceRoleClient();

  // Fetch agent config
  const { data: agent } = await supabase
    .from("agents")
    .select("*")
    .eq("id", agentId)
    .single();

  if (!agent) {
    return {
      content: "I apologize, but I am currently unavailable. Please try again later.",
      should_escalate: false,
    };
  }

  // Check escalation rules first
  const escalation = await checkEscalationRules(
    agent as Agent,
    userMessage,
    previousMessages
  );

  if (escalation) {
    return {
      content: escalation.message || agent.fallback_message,
      should_escalate: true,
      escalation_reason: escalation.reason,
      escalation_priority: escalation.priority,
    };
  }

  // Check for conversation flows
  const flowResponse = await checkConversationFlows(supabase, agentId, userMessage);
  if (flowResponse) {
    return { content: flowResponse, should_escalate: false };
  }

  // Get knowledge base context
  const { data: kbLinks } = await supabase
    .from("agent_knowledge_bases")
    .select("kb_id")
    .eq("agent_id", agentId);

  const kbIds = (kbLinks || []).map((l: { kb_id: string }) => l.kb_id);
  const searchResults = await searchKnowledgeBase(userMessage, kbIds);
  const knowledgeContext = buildKnowledgeContext(searchResults);

  // Build system prompt with brand voice and context
  const systemPrompt = buildSystemPrompt(agent as Agent, knowledgeContext);

  // Format conversation history
  const conversationHistory = previousMessages.slice(-20).map((m) => ({
    role: (m.sender_type === "visitor" ? "user" : "assistant") as "user" | "assistant",
    content: m.content,
  }));

  // Check if the user is requesting an action
  const actionResult = await detectAndExecuteAction(
    agent as Agent,
    sessionId,
    userMessage,
    conversationHistory
  );

  let actionContext = "";
  let actionTaken: { type: string; result: Record<string, unknown> } | undefined;

  if (actionResult) {
    actionContext = `\n\nAction executed: ${actionResult.type}\nResult: ${actionResult.result.message}`;
    actionTaken = { type: actionResult.type, result: actionResult.result };
  }

  // Generate AI response
  const finalSystemPrompt = systemPrompt + actionContext;
  const aiResponse = await generateChatResponse({
    systemPrompt: finalSystemPrompt,
    messages: [
      ...conversationHistory,
      { role: "user", content: userMessage },
    ],
    model: agent.model,
    temperature: agent.temperature,
    maxTokens: agent.max_tokens,
  });

  // Track analytics
  await supabase.from("analytics_events").insert({
    org_id: agent.org_id,
    event_type: "ai_response",
    session_id: sessionId,
    agent_id: agentId,
    data: {
      knowledge_results: searchResults.length,
      action_taken: actionTaken?.type || null,
      response_length: aiResponse.length,
    },
  });

  return {
    content: aiResponse,
    action_taken: actionTaken,
    should_escalate: false,
  };
}

function buildSystemPrompt(agent: Agent, knowledgeContext: string): string {
  const voice = agent.brand_voice;
  const voiceInstructions = `
Tone: ${voice.tone}
Formality level: ${voice.formality}
Personality: ${voice.personality}
${voice.custom_instructions ? `Additional instructions: ${voice.custom_instructions}` : ""}
`;

  const actionInstructions = agent.allowed_actions.length > 0
    ? `\nYou can perform these actions when requested: ${agent.allowed_actions.join(", ")}.
When an action has been executed, incorporate the result naturally into your response.`
    : "";

  return `${agent.system_prompt}

Brand Voice Guidelines:
${voiceInstructions}

${knowledgeContext ? `\n${knowledgeContext}\n\nUse the knowledge base information above to answer questions accurately. If the information doesn't cover the question, say so honestly.` : ""}
${actionInstructions}

If you cannot help with a request, suggest escalating to a human agent.`;
}

async function checkEscalationRules(
  agent: Agent,
  message: string,
  previousMessages: ChatMessage[]
): Promise<{ reason: string; priority: string; message?: string } | null> {
  const rules: EscalationRule[] = agent.escalation_rules || [];
  const lowerMessage = message.toLowerCase();

  for (const rule of rules) {
    switch (rule.trigger) {
      case "keyword": {
        const keywords = rule.condition.toLowerCase().split(",").map((k) => k.trim());
        if (keywords.some((kw) => lowerMessage.includes(kw))) {
          return {
            reason: `Keyword trigger: ${rule.condition}`,
            priority: rule.priority,
            message: rule.message,
          };
        }
        break;
      }
      case "sentiment": {
        const sentiment = await detectSentiment(message);
        if (sentiment === "negative" && rule.condition === "negative") {
          return {
            reason: "Negative sentiment detected",
            priority: rule.priority,
            message: rule.message,
          };
        }
        break;
      }
      case "repeated_failure": {
        const threshold = parseInt(rule.condition) || 3;
        const recentAiMessages = previousMessages
          .filter((m) => m.sender_type === "ai")
          .slice(-threshold);
        const fallbackCount = recentAiMessages.filter((m) =>
          m.content.includes("unable to help") ||
          m.content.includes("don't have") ||
          m.content.includes("cannot")
        ).length;
        if (fallbackCount >= threshold) {
          return {
            reason: `Repeated failures (${fallbackCount} fallbacks)`,
            priority: rule.priority,
            message: rule.message,
          };
        }
        break;
      }
      case "explicit_request": {
        const escalationPhrases = [
          "speak to a human",
          "talk to a person",
          "human agent",
          "real person",
          "transfer me",
          "speak to someone",
          "talk to agent",
          "supervisor",
          "manager",
        ];
        if (escalationPhrases.some((p) => lowerMessage.includes(p))) {
          return {
            reason: "Customer explicitly requested human agent",
            priority: rule.priority,
            message: rule.message,
          };
        }
        break;
      }
    }
  }

  return null;
}

async function checkConversationFlows(
  supabase: ReturnType<typeof createServiceRoleClient>,
  agentId: string,
  message: string
): Promise<string | null> {
  const { data: flows } = await supabase
    .from("conversation_flows")
    .select("*")
    .eq("agent_id", agentId)
    .eq("is_active", true);

  if (!flows || flows.length === 0) return null;

  const lowerMessage = message.toLowerCase();
  const matchedFlow = flows.find((flow: { trigger_keywords: string[] }) =>
    flow.trigger_keywords.some((kw: string) => lowerMessage.includes(kw.toLowerCase()))
  );

  if (!matchedFlow) return null;

  // Get the start node and first message
  const { data: startNode } = await supabase
    .from("flow_nodes")
    .select("*")
    .eq("flow_id", matchedFlow.id)
    .eq("node_type", "start")
    .single();

  if (!startNode) return null;

  // Get first edge from start
  const { data: edge } = await supabase
    .from("flow_edges")
    .select("*, target:target_node_id(*)")
    .eq("source_node_id", startNode.id)
    .order("sort_order")
    .limit(1)
    .single();

  if (!edge?.target) return null;

  const targetContent = (edge.target as unknown as { content: { text?: string } }).content;
  return targetContent?.text || null;
}

async function detectAndExecuteAction(
  agent: Agent,
  sessionId: string,
  message: string,
  _history: { role: string; content: string }[]
): Promise<{ type: string; result: Record<string, unknown> & { message: string } } | null> {
  if (agent.allowed_actions.length === 0) return null;

  const lowerMessage = message.toLowerCase();

  const actionPatterns: Record<string, string[]> = {
    process_return: ["return", "refund", "send back", "return item"],
    check_order_status: ["order status", "where is my order", "tracking", "delivery status", "shipment"],
    update_account: ["update my", "change my", "update account", "change email", "change address", "change phone"],
    schedule_callback: ["call me", "callback", "call back", "phone call", "schedule a call"],
    lookup_product: ["product info", "is it in stock", "product details", "availability"],
    apply_discount: ["discount", "coupon", "promo code", "promotion"],
    cancel_order: ["cancel order", "cancel my order", "want to cancel"],
  };

  let detectedAction: string | null = null;
  for (const [action, patterns] of Object.entries(actionPatterns)) {
    if (agent.allowed_actions.includes(action) && patterns.some((p) => lowerMessage.includes(p))) {
      detectedAction = action;
      break;
    }
  }

  if (!detectedAction) return null;

  // Extract parameters from message using simple heuristics
  const params = extractActionParams(detectedAction, message);
  const result = await executeAction(sessionId, detectedAction as ActionType, params);

  return {
    type: detectedAction,
    result: { ...result.data, message: result.message, success: result.success },
  };
}

function extractActionParams(actionType: string, message: string): Record<string, unknown> {
  const orderIdMatch = message.match(/(?:order|#)\s*([A-Z0-9-]+)/i);
  const emailMatch = message.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch = message.match(/\+?[\d\s()-]{10,}/);

  const params: Record<string, unknown> = {};

  switch (actionType) {
    case "process_return":
    case "check_order_status":
    case "cancel_order":
    case "apply_discount":
      if (orderIdMatch) params.order_id = orderIdMatch[1];
      break;
    case "update_account":
      if (emailMatch) {
        params.field = "email";
        params.value = emailMatch[0];
      }
      break;
    case "schedule_callback":
      if (phoneMatch) params.phone = phoneMatch[0].trim();
      break;
    case "lookup_product":
      params.query = message;
      break;
  }

  return params;
}

export async function handleEscalation(
  sessionId: string,
  agentId: string,
  reason: string,
  priority: string
): Promise<void> {
  const supabase = createServiceRoleClient();

  // Get agent's org
  const { data: agent } = await supabase
    .from("agents")
    .select("org_id")
    .eq("id", agentId)
    .single();

  if (!agent) return;

  // Get recent messages for context
  const { data: messages } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  const contextSummary = messages && messages.length > 0
    ? await summarizeConversation(
        messages.map((m: ChatMessage) => ({
          role: m.sender_type === "visitor" ? "customer" : m.sender_type,
          content: m.content,
        }))
      )
    : "No conversation context available.";

  // Find available agent
  const { data: availableAgent } = await supabase
    .from("users")
    .select("id")
    .eq("org_id", agent.org_id)
    .eq("is_available", true)
    .eq("role", "agent")
    .limit(1)
    .single();

  // Update session
  await supabase
    .from("chat_sessions")
    .update({
      status: "escalated",
      escalated_at: new Date().toISOString(),
      assigned_user_id: availableAgent?.id || null,
    })
    .eq("id", sessionId);

  // Create escalation record
  await supabase.from("escalations").insert({
    session_id: sessionId,
    reason,
    priority,
    assigned_to: availableAgent?.id || null,
    context_summary: contextSummary,
    status: availableAgent ? "accepted" : "pending",
  });

  // Track event
  await supabase.from("analytics_events").insert({
    org_id: agent.org_id,
    event_type: "escalation",
    session_id: sessionId,
    agent_id: agentId,
    data: { reason, priority, assigned_to: availableAgent?.id || null },
  });
}
