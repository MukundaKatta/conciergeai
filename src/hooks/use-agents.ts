"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Agent } from "@/types/database";

export function useAgents(orgId: string) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from("agents")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setAgents((data as Agent[]) || []);
    }
    setLoading(false);
  }, [orgId, supabase]);

  useEffect(() => {
    if (orgId) fetchAgents();
  }, [orgId, fetchAgents]);

  const createAgent = async (agent: Partial<Agent>) => {
    const { data, error: err } = await supabase
      .from("agents")
      .insert({ ...agent, org_id: orgId })
      .select()
      .single();

    if (err) throw new Error(err.message);
    setAgents((prev) => [data as Agent, ...prev]);
    return data as Agent;
  };

  const updateAgent = async (id: string, updates: Partial<Agent>) => {
    const { data, error: err } = await supabase
      .from("agents")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (err) throw new Error(err.message);
    setAgents((prev) => prev.map((a) => (a.id === id ? (data as Agent) : a)));
    return data as Agent;
  };

  const deleteAgent = async (id: string) => {
    const { error: err } = await supabase.from("agents").delete().eq("id", id);
    if (err) throw new Error(err.message);
    setAgents((prev) => prev.filter((a) => a.id !== id));
  };

  return { agents, loading, error, createAgent, updateAgent, deleteAgent, refetch: fetchAgents };
}

export function useAgent(agentId: string) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    if (!agentId) return;
    const fetch = async () => {
      const { data } = await supabase.from("agents").select("*").eq("id", agentId).single();
      setAgent(data as Agent | null);
      setLoading(false);
    };
    fetch();
  }, [agentId, supabase]);

  return { agent, loading };
}
