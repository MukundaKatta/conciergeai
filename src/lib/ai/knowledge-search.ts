import { createServiceRoleClient } from "@/lib/supabase/server";
import { generateEmbedding } from "./openai";

interface SearchResult {
  id: string;
  document_id: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

export async function searchKnowledgeBase(
  query: string,
  knowledgeBaseIds: string[],
  maxResults: number = 5,
  threshold: number = 0.7
): Promise<SearchResult[]> {
  if (knowledgeBaseIds.length === 0) return [];

  const embedding = await generateEmbedding(query);
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase.rpc("match_knowledge_chunks", {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: maxResults,
    filter_kb_ids: knowledgeBaseIds,
  });

  if (error) {
    console.error("Knowledge search error:", error);
    return [];
  }

  return (data as SearchResult[]) || [];
}

export function buildKnowledgeContext(results: SearchResult[]): string {
  if (results.length === 0) return "";

  const contextParts = results.map(
    (r, i) => `[Source ${i + 1}]\n${r.content}`
  );

  return `Relevant knowledge base information:\n\n${contextParts.join("\n\n---\n\n")}`;
}
