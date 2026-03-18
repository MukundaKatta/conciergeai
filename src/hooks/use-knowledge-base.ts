"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { KnowledgeBase, KnowledgeDocument } from "@/types/database";

export function useKnowledgeBases(orgId: string) {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchKBs = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("knowledge_bases")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });
    setKnowledgeBases((data as KnowledgeBase[]) || []);
    setLoading(false);
  }, [orgId, supabase]);

  useEffect(() => {
    if (orgId) fetchKBs();
  }, [orgId, fetchKBs]);

  const createKB = async (name: string, description: string) => {
    const { data, error } = await supabase
      .from("knowledge_bases")
      .insert({ org_id: orgId, name, description })
      .select()
      .single();
    if (error) throw new Error(error.message);
    setKnowledgeBases((prev) => [data as KnowledgeBase, ...prev]);
    return data as KnowledgeBase;
  };

  const deleteKB = async (id: string) => {
    const { error } = await supabase.from("knowledge_bases").delete().eq("id", id);
    if (error) throw new Error(error.message);
    setKnowledgeBases((prev) => prev.filter((kb) => kb.id !== id));
  };

  return { knowledgeBases, loading, createKB, deleteKB, refetch: fetchKBs };
}

export function useKnowledgeDocuments(kbId: string) {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("knowledge_documents")
      .select("*")
      .eq("kb_id", kbId)
      .order("created_at", { ascending: false });
    setDocuments((data as KnowledgeDocument[]) || []);
    setLoading(false);
  }, [kbId, supabase]);

  useEffect(() => {
    if (kbId) fetchDocs();
  }, [kbId, fetchDocs]);

  const addDocument = async (doc: Partial<KnowledgeDocument>) => {
    const { data, error } = await supabase
      .from("knowledge_documents")
      .insert({ ...doc, kb_id: kbId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    setDocuments((prev) => [data as KnowledgeDocument, ...prev]);
    return data as KnowledgeDocument;
  };

  const updateDocument = async (id: string, updates: Partial<KnowledgeDocument>) => {
    const { data, error } = await supabase
      .from("knowledge_documents")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    setDocuments((prev) => prev.map((d) => (d.id === id ? (data as KnowledgeDocument) : d)));
    return data as KnowledgeDocument;
  };

  const deleteDocument = async (id: string) => {
    const { error } = await supabase.from("knowledge_documents").delete().eq("id", id);
    if (error) throw new Error(error.message);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return { documents, loading, addDocument, updateDocument, deleteDocument, refetch: fetchDocs };
}
