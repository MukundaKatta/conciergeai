"use client";

import { useState } from "react";
import {
  Shield,
  Star,
  AlertTriangle,
  CheckCircle,
  Flag,
  MessageSquare,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface QAItem {
  id: string;
  sessionId: string;
  visitor: string;
  agent: string;
  date: string;
  status: "pending" | "reviewed" | "flagged";
  score: number | null;
  messages: { sender: string; content: string }[];
  notes: string;
  flaggedIssues: string[];
  categories: Record<string, number>;
}

const demoQAItems: QAItem[] = [
  {
    id: "qa1",
    sessionId: "sess-001",
    visitor: "John D.",
    agent: "Support Bot",
    date: "2026-03-17T10:30:00Z",
    status: "pending",
    score: null,
    messages: [
      { sender: "visitor", content: "Hi, I need to return an item I bought last week." },
      { sender: "ai", content: "I'd be happy to help you with a return. Could you please provide your order number?" },
      { sender: "visitor", content: "It's ORDER-12345" },
      { sender: "ai", content: "I've initiated the return process for order ORDER-12345. A return shipping label has been sent to your email. The refund will be processed within 5-7 business days once we receive the item." },
      { sender: "visitor", content: "Great, thanks!" },
      { sender: "ai", content: "You're welcome! Is there anything else I can help you with?" },
    ],
    notes: "",
    flaggedIssues: [],
    categories: {},
  },
  {
    id: "qa2",
    sessionId: "sess-002",
    visitor: "Sarah M.",
    agent: "Support Bot",
    date: "2026-03-16T14:15:00Z",
    status: "reviewed",
    score: 8,
    messages: [
      { sender: "visitor", content: "My order hasn't arrived and it's been 2 weeks" },
      { sender: "ai", content: "I'm sorry to hear about the delay. Let me look into this for you. Could you provide your order number?" },
      { sender: "visitor", content: "ORDER-67890" },
      { sender: "ai", content: "I've checked your order status. It shows the package is currently in transit and should arrive within the next 2-3 business days. The tracking number is TRK-ABC123." },
      { sender: "visitor", content: "That's too long. I want a refund." },
      { sender: "ai", content: "I understand your frustration. Let me connect you with a team member who can process a refund or expedite your delivery." },
    ],
    notes: "Good handling but could have offered more proactive solutions before escalating.",
    flaggedIssues: [],
    categories: { accuracy: 9, tone: 8, helpfulness: 7, efficiency: 8 },
  },
  {
    id: "qa3",
    sessionId: "sess-003",
    visitor: "Mike R.",
    agent: "Sales Bot",
    date: "2026-03-15T09:00:00Z",
    status: "flagged",
    score: 4,
    messages: [
      { sender: "visitor", content: "Can you tell me about your enterprise plan?" },
      { sender: "ai", content: "Our enterprise plan starts at $499/month and includes unlimited seats." },
      { sender: "visitor", content: "What about the API limits?" },
      { sender: "ai", content: "I don't have specific information about API limits. Let me check that for you." },
      { sender: "visitor", content: "That's basic info, why don't you know this?" },
      { sender: "ai", content: "I apologize for the inconvenience. Our enterprise plan includes 100,000 API calls per month." },
    ],
    notes: "Agent provided potentially incorrect pricing info without verification. Knowledge base may need updating.",
    flaggedIssues: ["Potentially incorrect pricing", "Missing product knowledge", "Slow response to basic query"],
    categories: { accuracy: 3, tone: 6, helpfulness: 4, efficiency: 5 },
  },
];

const QA_CATEGORIES = ["accuracy", "tone", "helpfulness", "efficiency"];

export function QADashboard() {
  const [items, setItems] = useState<QAItem[]>(demoQAItems);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("");

  const reviewed = items.filter((i) => i.status === "reviewed").length;
  const flagged = items.filter((i) => i.status === "flagged").length;
  const avgScore = items.filter((i) => i.score !== null).reduce((sum, i) => sum + (i.score || 0), 0) / (items.filter((i) => i.score !== null).length || 1);

  const filteredItems = filterStatus ? items.filter((i) => i.status === filterStatus) : items;

  const updateItem = (id: string, updates: Partial<QAItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const handleScore = (id: string, score: number) => {
    updateItem(id, { score, status: "reviewed" });
    toast.success("Review saved");
  };

  const handleFlag = (id: string, issue: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    updateItem(id, {
      status: "flagged",
      flaggedIssues: [...item.flaggedIssues, issue],
    });
    toast.success("Issue flagged");
  };

  const randomReview = () => {
    const pending = items.filter((i) => i.status === "pending");
    if (pending.length > 0) {
      const random = pending[Math.floor(Math.random() * pending.length)];
      setExpandedItem(random.id);
    } else {
      toast("No pending reviews available");
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard title="Total Reviews" value={items.length} icon={Shield} />
        <StatCard title="Reviewed" value={reviewed} icon={CheckCircle} />
        <StatCard title="Flagged" value={flagged} icon={AlertTriangle} />
        <StatCard title="Avg Score" value={`${avgScore.toFixed(1)}/10`} icon={Star} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {["", "pending", "reviewed", "flagged"].map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(status)}
            >
              {status || "All"}
            </Button>
          ))}
        </div>
        <Button onClick={randomReview}>
          <RefreshCw className="mr-2 h-4 w-4" /> Random Review
        </Button>
      </div>

      <div className="space-y-4">
        {filteredItems.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-0">
              <button
                className="flex w-full items-center justify-between p-4 text-left"
                onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{item.visitor}</span>
                      <span className="text-sm text-gray-500">with {item.agent}</span>
                    </div>
                    <p className="text-xs text-gray-400">{new Date(item.date).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {item.score !== null && (
                    <Badge variant={item.score >= 7 ? "success" : item.score >= 5 ? "warning" : "destructive"}>
                      {item.score}/10
                    </Badge>
                  )}
                  <Badge
                    variant={
                      item.status === "reviewed" ? "success" :
                      item.status === "flagged" ? "destructive" :
                      "secondary"
                    }
                  >
                    {item.status}
                  </Badge>
                  {expandedItem === item.id ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </button>

              {expandedItem === item.id && (
                <div className="border-t border-gray-100 p-4">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Conversation */}
                    <div>
                      <h4 className="mb-3 text-sm font-medium text-gray-700">Conversation</h4>
                      <div className="max-h-[400px] space-y-3 overflow-y-auto rounded-lg bg-gray-50 p-4">
                        {item.messages.map((msg, i) => (
                          <div
                            key={i}
                            className={cn(
                              "rounded-lg px-3 py-2 text-sm",
                              msg.sender === "visitor"
                                ? "bg-white border border-gray-200"
                                : "bg-brand-50 text-brand-900"
                            )}
                          >
                            <span className="text-xs font-medium text-gray-500">
                              {msg.sender === "visitor" ? "Visitor" : "AI Agent"}
                            </span>
                            <p className="mt-0.5">{msg.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Review Form */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-700">Review</h4>

                      {/* Category scores */}
                      <div className="space-y-3">
                        {QA_CATEGORIES.map((cat) => (
                          <div key={cat} className="flex items-center justify-between">
                            <span className="text-sm capitalize text-gray-600">{cat}</span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                                <button
                                  key={score}
                                  className={cn(
                                    "h-7 w-7 rounded text-xs font-medium transition-colors",
                                    (item.categories[cat] || 0) >= score
                                      ? score >= 7 ? "bg-green-500 text-white" : score >= 4 ? "bg-yellow-500 text-white" : "bg-red-500 text-white"
                                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                  )}
                                  onClick={() => {
                                    updateItem(item.id, {
                                      categories: { ...item.categories, [cat]: score },
                                    });
                                  }}
                                >
                                  {score}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Overall score */}
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          Overall Score (1-10)
                        </label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                            <button
                              key={score}
                              className={cn(
                                "h-9 w-9 rounded-lg text-sm font-medium transition-colors",
                                item.score === score
                                  ? "bg-brand-600 text-white"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              )}
                              onClick={() => handleScore(item.id, score)}
                            >
                              {score}
                            </button>
                          ))}
                        </div>
                      </div>

                      <Textarea
                        label="Notes"
                        value={item.notes}
                        onChange={(e) => updateItem(item.id, { notes: e.target.value })}
                        placeholder="Add review notes..."
                        rows={3}
                      />

                      {/* Flag issues */}
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">Flagged Issues</label>
                        {item.flaggedIssues.length > 0 && (
                          <div className="mb-2 flex flex-wrap gap-1">
                            {item.flaggedIssues.map((issue, i) => (
                              <Badge key={i} variant="destructive" className="text-xs">
                                <Flag className="mr-1 h-3 w-3" /> {issue}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Input
                            id={`flag-${item.id}`}
                            placeholder="Describe the issue..."
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const input = e.target as HTMLInputElement;
                                if (input.value.trim()) {
                                  handleFlag(item.id, input.value.trim());
                                  input.value = "";
                                }
                              }
                            }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const input = document.getElementById(`flag-${item.id}`) as HTMLInputElement;
                              if (input?.value.trim()) {
                                handleFlag(item.id, input.value.trim());
                                input.value = "";
                              }
                            }}
                          >
                            <Flag className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
