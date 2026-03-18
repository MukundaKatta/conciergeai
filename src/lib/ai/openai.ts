import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

export async function generateChatResponse(params: {
  systemPrompt: string;
  messages: { role: "user" | "assistant" | "system"; content: string }[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  const {
    systemPrompt,
    messages,
    model = "gpt-4o-mini",
    temperature = 0.7,
    maxTokens = 1024,
  } = params;

  const response = await openai.chat.completions.create({
    model,
    temperature,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
  });

  return response.choices[0]?.message?.content || "";
}

export async function generateStreamingResponse(params: {
  systemPrompt: string;
  messages: { role: "user" | "assistant" | "system"; content: string }[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}) {
  const {
    systemPrompt,
    messages,
    model = "gpt-4o-mini",
    temperature = 0.7,
    maxTokens = 1024,
  } = params;

  const stream = await openai.chat.completions.create({
    model,
    temperature,
    max_tokens: maxTokens,
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
  });

  return stream;
}

export async function detectIntent(message: string, possibleIntents: string[]): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    max_tokens: 50,
    messages: [
      {
        role: "system",
        content: `Classify the user message into one of these intents: ${possibleIntents.join(", ")}. Respond with only the intent name.`,
      },
      { role: "user", content: message },
    ],
  });

  return response.choices[0]?.message?.content?.trim() || "unknown";
}

export async function detectSentiment(message: string): Promise<"positive" | "neutral" | "negative"> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    max_tokens: 10,
    messages: [
      {
        role: "system",
        content: "Classify the sentiment of the user message as exactly one of: positive, neutral, negative. Respond with only the sentiment.",
      },
      { role: "user", content: message },
    ],
  });

  const sentiment = response.choices[0]?.message?.content?.trim().toLowerCase();
  if (sentiment === "positive" || sentiment === "negative") return sentiment;
  return "neutral";
}

export async function summarizeConversation(
  messages: { role: string; content: string }[]
): Promise<string> {
  const conversationText = messages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    max_tokens: 300,
    messages: [
      {
        role: "system",
        content: "Summarize this customer service conversation in 2-3 sentences, focusing on the customer's issue and any resolution provided.",
      },
      { role: "user", content: conversationText },
    ],
  });

  return response.choices[0]?.message?.content || "";
}

export default openai;
