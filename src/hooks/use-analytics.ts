"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AnalyticsSummary } from "@/types/database";

export function useAnalytics(orgId: string, dateRange?: { from: string; to: string }) {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);

    const fromDate = dateRange?.from || new Date(Date.now() - 30 * 86400000).toISOString();
    const toDate = dateRange?.to || new Date().toISOString();

    // Fetch sessions in date range
    const { data: sessions } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("org_id", orgId)
      .gte("created_at", fromDate)
      .lte("created_at", toDate);

    const allSessions = sessions || [];
    const totalSessions = allSessions.length;
    const resolvedSessions = allSessions.filter((s) => s.status === "resolved").length;
    const escalatedSessions = allSessions.filter((s) => s.status === "escalated").length;

    // Calculate average resolution time
    const resolvedWithTime = allSessions.filter((s) => s.status === "resolved" && s.ended_at);
    const avgResTime = resolvedWithTime.length > 0
      ? resolvedWithTime.reduce((sum, s) => {
          const start = new Date(s.started_at).getTime();
          const end = new Date(s.ended_at!).getTime();
          return sum + (end - start) / 60000;
        }, 0) / resolvedWithTime.length
      : 0;

    // Average CSAT
    const ratedSessions = allSessions.filter((s) => s.csat_score !== null);
    const avgCsat = ratedSessions.length > 0
      ? ratedSessions.reduce((sum, s) => sum + (s.csat_score || 0), 0) / ratedSessions.length
      : 0;

    // Sessions by channel
    const sessionsByChannel: Record<string, number> = { web: 0, email: 0, sms: 0 };
    allSessions.forEach((s) => {
      sessionsByChannel[s.channel] = (sessionsByChannel[s.channel] || 0) + 1;
    });

    // Sessions over time (by day)
    const byDate: Record<string, number> = {};
    allSessions.forEach((s) => {
      const day = new Date(s.created_at).toISOString().split("T")[0];
      byDate[day] = (byDate[day] || 0) + 1;
    });
    const sessionsOverTime = Object.entries(byDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Fetch common topics from events
    const { data: events } = await supabase
      .from("analytics_events")
      .select("data")
      .eq("org_id", orgId)
      .eq("event_type", "topic_detected")
      .gte("created_at", fromDate)
      .lte("created_at", toDate);

    const topicCounts: Record<string, number> = {};
    (events || []).forEach((e) => {
      const topic = (e.data as Record<string, string>)?.topic;
      if (topic) topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
    const commonTopics = Object.entries(topicCounts)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    setSummary({
      total_sessions: totalSessions,
      resolved_sessions: resolvedSessions,
      escalated_sessions: escalatedSessions,
      avg_resolution_time_minutes: Math.round(avgResTime * 10) / 10,
      avg_csat_score: Math.round(avgCsat * 10) / 10,
      resolution_rate: totalSessions > 0 ? Math.round((resolvedSessions / totalSessions) * 100) : 0,
      common_topics: commonTopics,
      sessions_by_channel: sessionsByChannel as AnalyticsSummary["sessions_by_channel"],
      sessions_over_time: sessionsOverTime,
    });

    setLoading(false);
  }, [orgId, dateRange?.from, dateRange?.to, supabase]);

  useEffect(() => {
    if (orgId) fetchAnalytics();
  }, [orgId, fetchAnalytics]);

  return { summary, loading, refetch: fetchAnalytics };
}
