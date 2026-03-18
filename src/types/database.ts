export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  org_id: string;
  email: string;
  full_name: string;
  role: "owner" | "admin" | "agent" | "viewer";
  avatar_url: string | null;
  is_available: boolean;
  created_at: string;
}

export interface BrandVoice {
  tone: "professional" | "casual" | "friendly" | "authoritative";
  formality: "formal" | "semi-formal" | "informal";
  personality: "helpful" | "witty" | "empathetic" | "direct";
  custom_instructions?: string;
}

export interface EscalationRule {
  id: string;
  trigger: "keyword" | "sentiment" | "repeated_failure" | "explicit_request" | "timeout";
  condition: string;
  priority: "low" | "normal" | "high" | "urgent";
  message?: string;
}

export interface WidgetConfig {
  primaryColor: string;
  position: "bottom-right" | "bottom-left";
  borderRadius: number;
  headerText?: string;
  showAvatar?: boolean;
}

export interface Agent {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  brand_voice: BrandVoice;
  system_prompt: string;
  model: string;
  temperature: number;
  max_tokens: number;
  allowed_actions: string[];
  escalation_rules: EscalationRule[];
  greeting_message: string;
  fallback_message: string;
  is_active: boolean;
  widget_config: WidgetConfig;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeBase {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface KnowledgeDocument {
  id: string;
  kb_id: string;
  title: string;
  content: string;
  doc_type: "text" | "faq" | "policy" | "product" | "url";
  source_url: string | null;
  metadata: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeChunk {
  id: string;
  document_id: string;
  content: string;
  embedding: number[] | null;
  chunk_index: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ConversationFlow {
  id: string;
  agent_id: string;
  name: string;
  description: string | null;
  trigger_keywords: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type FlowNodeType =
  | "start"
  | "message"
  | "question"
  | "condition"
  | "action"
  | "ai_fallback"
  | "escalate"
  | "end";

export interface FlowNodeContent {
  text?: string;
  options?: { label: string; value: string }[];
  condition_field?: string;
  condition_operator?: "equals" | "contains" | "greater_than" | "less_than";
  condition_value?: string;
  action_type?: string;
  action_params?: Record<string, unknown>;
}

export interface FlowNode {
  id: string;
  flow_id: string;
  node_type: FlowNodeType;
  label: string;
  content: FlowNodeContent;
  position_x: number;
  position_y: number;
  created_at: string;
}

export interface FlowEdge {
  id: string;
  flow_id: string;
  source_node_id: string;
  target_node_id: string;
  condition_label: string | null;
  condition_value: string | null;
  sort_order: number;
}

export type ChatChannel = "web" | "email" | "sms";
export type SessionStatus = "active" | "escalated" | "resolved" | "abandoned";

export interface ChatSession {
  id: string;
  agent_id: string | null;
  org_id: string;
  channel: ChatChannel;
  visitor_id: string | null;
  visitor_name: string | null;
  visitor_email: string | null;
  visitor_metadata: Record<string, unknown>;
  status: SessionStatus;
  assigned_user_id: string | null;
  resolution_summary: string | null;
  csat_score: number | null;
  csat_comment: string | null;
  ab_test_id: string | null;
  ab_variant: string | null;
  started_at: string;
  ended_at: string | null;
  escalated_at: string | null;
  created_at: string;
}

export type SenderType = "visitor" | "ai" | "agent";

export interface ChatMessage {
  id: string;
  session_id: string;
  sender_type: SenderType;
  sender_id: string | null;
  content: string;
  metadata: Record<string, unknown>;
  flow_node_id: string | null;
  created_at: string;
}

export interface ActionLog {
  id: string;
  session_id: string;
  action_type: string;
  input_data: Record<string, unknown>;
  output_data: Record<string, unknown>;
  status: "pending" | "success" | "failed";
  error_message: string | null;
  executed_at: string;
}

export interface Escalation {
  id: string;
  session_id: string;
  reason: string;
  priority: "low" | "normal" | "high" | "urgent";
  assigned_to: string | null;
  status: "pending" | "accepted" | "resolved" | "expired";
  context_summary: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface ABTestVariant {
  id: string;
  name: string;
  agent_id: string;
  description?: string;
}

export interface ABTest {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  status: "draft" | "running" | "paused" | "completed";
  variants: ABTestVariant[];
  traffic_split: Record<string, number>;
  metric_goals: Record<string, unknown>;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export interface QAReview {
  id: string;
  session_id: string;
  reviewer_id: string | null;
  score: number | null;
  categories: Record<string, number>;
  notes: string | null;
  flagged_issues: string[];
  status: "pending" | "reviewed" | "flagged";
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  org_id: string;
  event_type: string;
  session_id: string | null;
  agent_id: string | null;
  data: Record<string, unknown>;
  created_at: string;
}

// Aggregate types for analytics
export interface AnalyticsSummary {
  total_sessions: number;
  resolved_sessions: number;
  escalated_sessions: number;
  avg_resolution_time_minutes: number;
  avg_csat_score: number;
  resolution_rate: number;
  common_topics: { topic: string; count: number }[];
  sessions_by_channel: Record<ChatChannel, number>;
  sessions_over_time: { date: string; count: number }[];
}
