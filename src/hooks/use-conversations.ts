"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChatSession, ChatMessage } from "@/types/database";

export function useChatSessions(orgId: string, filters?: { status?: string; channel?: string }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("chat_sessions")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.channel) {
      query = query.eq("channel", filters.channel);
    }

    const { data } = await query;
    setSessions((data as ChatSession[]) || []);
    setLoading(false);
  }, [orgId, filters?.status, filters?.channel, supabase]);

  useEffect(() => {
    if (orgId) fetchSessions();
  }, [orgId, fetchSessions]);

  return { sessions, loading, refetch: fetchSessions };
}

export function useChatMessages(sessionId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });
    setMessages((data as ChatMessage[]) || []);
    setLoading(false);
  }, [sessionId, supabase]);

  useEffect(() => {
    if (sessionId) {
      fetchMessages();

      // Subscribe to real-time messages
      const channel = supabase
        .channel(`messages:${sessionId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "chat_messages", filter: `session_id=eq.${sessionId}` },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as ChatMessage]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [sessionId, supabase, fetchMessages]);

  const sendMessage = async (content: string, senderType: "visitor" | "agent", senderId?: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        session_id: sessionId,
        sender_type: senderType,
        sender_id: senderId || null,
        content,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as ChatMessage;
  };

  return { messages, loading, sendMessage, refetch: fetchMessages };
}
