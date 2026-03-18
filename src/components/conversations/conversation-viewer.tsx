"use client";

import { useState } from "react";
import { ArrowLeft, Bot, User, Headphones, Send, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useChatMessages } from "@/hooks/use-conversations";
import type { ChatSession, ChatMessage } from "@/types/database";
import { formatTime, statusColor, priorityColor } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ConversationViewerProps {
  session: ChatSession;
  onBack: () => void;
}

export function ConversationViewer({ session, onBack }: ConversationViewerProps) {
  const { messages, loading, sendMessage } = useChatMessages(session.id);
  const [agentInput, setAgentInput] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendAgentMessage = async () => {
    if (!agentInput.trim()) return;
    setSending(true);
    try {
      await sendMessage(agentInput, "agent", "manual");
      setAgentInput("");
    } catch {
      // Error handled by hook
    }
    setSending(false);
  };

  const senderIcon = (type: string) => {
    switch (type) {
      case "visitor": return <User className="h-4 w-4" />;
      case "ai": return <Bot className="h-4 w-4" />;
      case "agent": return <Headphones className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const senderColor = (type: string) => {
    switch (type) {
      case "visitor": return "bg-gray-100 text-gray-800";
      case "ai": return "bg-brand-50 text-brand-900";
      case "agent": return "bg-green-50 text-green-900";
      default: return "bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900">
            {session.visitor_name || session.visitor_email || "Anonymous Visitor"}
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(session.status)}`}>
              {session.status}
            </span>
            <span>Channel: {session.channel}</span>
            {session.csat_score && <span>CSAT: {session.csat_score}/5</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Messages */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[500px] space-y-4 overflow-y-auto">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-200" />
                        <div className="h-12 w-64 rounded-lg bg-gray-200" />
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-500">No messages yet.</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-3",
                        msg.sender_type === "visitor" ? "justify-start" : "justify-start"
                      )}
                    >
                      <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", senderColor(msg.sender_type))}>
                        {senderIcon(msg.sender_type)}
                      </div>
                      <div className="max-w-[80%]">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-600">
                            {msg.sender_type === "visitor" ? "Visitor" : msg.sender_type === "ai" ? "AI Agent" : "Human Agent"}
                          </span>
                          <span className="text-xs text-gray-400">{formatTime(msg.created_at)}</span>
                        </div>
                        <div className={cn("mt-1 rounded-lg px-3 py-2 text-sm", senderColor(msg.sender_type))}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Agent reply input (for escalated sessions) */}
              {session.status === "escalated" && (
                <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                  <Input
                    value={agentInput}
                    onChange={(e) => setAgentInput(e.target.value)}
                    placeholder="Type a reply as human agent..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendAgentMessage();
                      }
                    }}
                  />
                  <Button onClick={handleSendAgentMessage} loading={sending}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Session details */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Session Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Session ID</span>
                <span className="font-mono text-xs">{session.id.slice(0, 12)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Channel</span>
                <Badge variant="outline">{session.channel}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Started</span>
                <span>{new Date(session.started_at).toLocaleString()}</span>
              </div>
              {session.ended_at && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Ended</span>
                  <span>{new Date(session.ended_at).toLocaleString()}</span>
                </div>
              )}
              {session.visitor_email && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span>{session.visitor_email}</span>
                </div>
              )}
              {session.resolution_summary && (
                <div className="border-t pt-3">
                  <span className="text-gray-500">Resolution Summary</span>
                  <p className="mt-1 text-gray-700">{session.resolution_summary}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {session.status === "escalated" && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-orange-800">Escalated</span>
                </div>
                <p className="mt-1 text-sm text-orange-700">
                  This conversation has been escalated to a human agent.
                  {session.escalated_at && ` (${new Date(session.escalated_at).toLocaleString()})`}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
