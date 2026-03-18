"use client";

import { useState } from "react";
import { MessageSquare, GitBranch, Eye } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ConversationViewer } from "./conversation-viewer";
import { FlowDesigner } from "./flow-designer";
import { useChatSessions } from "@/hooks/use-conversations";
import { DEMO_ORG } from "@/lib/store";
import { formatRelativeTime, statusColor } from "@/lib/utils";
import type { ChatSession } from "@/types/database";

export function ConversationManager() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { sessions, loading } = useChatSessions(DEMO_ORG.id, { status: statusFilter || undefined });
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);

  if (selectedSession) {
    return (
      <ConversationViewer
        session={selectedSession}
        onBack={() => setSelectedSession(null)}
      />
    );
  }

  return (
    <Tabs
      tabs={[
        { id: "sessions", label: "Chat Sessions", count: sessions.length },
        { id: "flows", label: "Conversation Flows" },
      ]}
    >
      {(activeTab) => (
        <>
          {activeTab === "sessions" && (
            <div>
              <div className="mb-4 flex items-center gap-2">
                {["", "active", "escalated", "resolved", "abandoned"].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status || "All"}
                  </Button>
                ))}
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse rounded-lg border p-4">
                      <div className="h-4 w-40 rounded bg-gray-200" />
                    </div>
                  ))}
                </div>
              ) : sessions.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title="No conversations found"
                  description="Conversations will appear here when visitors interact with your AI agents."
                />
              ) : (
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <Card
                      key={session.id}
                      className="cursor-pointer transition-shadow hover:shadow-md"
                      onClick={() => setSelectedSession(session)}
                    >
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <MessageSquare className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">
                                {session.visitor_name || session.visitor_email || `Visitor ${session.visitor_id?.slice(0, 8) || "unknown"}`}
                              </span>
                              <Badge variant="outline" className="text-xs">{session.channel}</Badge>
                            </div>
                            <p className="text-xs text-gray-500">
                              Started {formatRelativeTime(session.started_at)}
                              {session.csat_score && ` | CSAT: ${session.csat_score}/5`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(session.status)}`}>
                            {session.status}
                          </span>
                          <Eye className="h-4 w-4 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "flows" && <FlowDesigner />}
        </>
      )}
    </Tabs>
  );
}
