"use client";

import { useState } from "react";
import {
  MessageSquare,
  CheckCircle,
  ArrowUpRight,
  Clock,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAnalytics } from "@/hooks/use-analytics";
import { DEMO_ORG } from "@/lib/store";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#4263eb", "#f59e0b", "#10b981", "#ef4444"];

// Demo data for visualization when no real data exists
const demoSessionsOverTime = [
  { date: "2026-03-10", count: 45 },
  { date: "2026-03-11", count: 62 },
  { date: "2026-03-12", count: 58 },
  { date: "2026-03-13", count: 71 },
  { date: "2026-03-14", count: 49 },
  { date: "2026-03-15", count: 38 },
  { date: "2026-03-16", count: 55 },
  { date: "2026-03-17", count: 67 },
];

const demoChannelData = [
  { name: "Web Chat", value: 65 },
  { name: "Email", value: 25 },
  { name: "SMS", value: 10 },
];

const demoTopics = [
  { topic: "Order Status", count: 142 },
  { topic: "Returns & Refunds", count: 98 },
  { topic: "Product Questions", count: 76 },
  { topic: "Account Issues", count: 54 },
  { topic: "Shipping", count: 41 },
  { topic: "Billing", count: 33 },
  { topic: "Technical Support", count: 28 },
];

const demoRecentSessions = [
  { id: "1", visitor: "John D.", status: "resolved", channel: "web", time: "5 min ago", agent: "Support Bot" },
  { id: "2", visitor: "Sarah M.", status: "active", channel: "email", time: "12 min ago", agent: "Sales Bot" },
  { id: "3", visitor: "Mike R.", status: "escalated", channel: "web", time: "18 min ago", agent: "Support Bot" },
  { id: "4", visitor: "Emily L.", status: "resolved", channel: "sms", time: "25 min ago", agent: "Support Bot" },
  { id: "5", visitor: "David K.", status: "resolved", channel: "web", time: "32 min ago", agent: "Sales Bot" },
];

export function DashboardOverview() {
  const [dateRange] = useState({ from: new Date(Date.now() - 30 * 86400000).toISOString(), to: new Date().toISOString() });
  const { summary } = useAnalytics(DEMO_ORG.id, dateRange);

  const sessionsData = summary?.sessions_over_time.length ? summary.sessions_over_time : demoSessionsOverTime;
  const topicsData = summary?.common_topics.length ? summary.common_topics : demoTopics;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Conversations"
          value={summary?.total_sessions || 445}
          change="+12% from last month"
          changeType="positive"
          icon={MessageSquare}
        />
        <StatCard
          title="Resolution Rate"
          value={`${summary?.resolution_rate || 87}%`}
          change="+3% from last month"
          changeType="positive"
          icon={CheckCircle}
        />
        <StatCard
          title="Avg Handle Time"
          value={`${summary?.avg_resolution_time_minutes || 4.2}m`}
          change="-0.5m from last month"
          changeType="positive"
          icon={Clock}
        />
        <StatCard
          title="CSAT Score"
          value={`${summary?.avg_csat_score || 4.3}/5`}
          change="+0.2 from last month"
          changeType="positive"
          icon={Star}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand-600" />
              Conversations Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sessionsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(v) => v.split("-").slice(1).join("/")} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#4263eb" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-600" />
              By Channel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={demoChannelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {demoChannelData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex justify-center gap-4">
              {demoChannelData.map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  {entry.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-brand-600" />
              Common Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topicsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="topic" tick={{ fontSize: 12 }} width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#4263eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-brand-600" />
              Recent Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {demoRecentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                      {session.visitor.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{session.visitor}</p>
                      <p className="text-xs text-gray-500">{session.agent} &middot; {session.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        session.status === "resolved" ? "success" :
                        session.status === "active" ? "default" :
                        "warning"
                      }
                    >
                      {session.status}
                    </Badge>
                    <ArrowUpRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
