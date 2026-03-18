"use client";

import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Star,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Users,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
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
  Legend,
} from "recharts";

const COLORS = ["#4263eb", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

const resolutionData = [
  { date: "Mon", resolved: 42, escalated: 8, abandoned: 3 },
  { date: "Tue", resolved: 55, escalated: 12, abandoned: 5 },
  { date: "Wed", resolved: 48, escalated: 6, abandoned: 2 },
  { date: "Thu", resolved: 61, escalated: 9, abandoned: 4 },
  { date: "Fri", resolved: 53, escalated: 11, abandoned: 6 },
  { date: "Sat", resolved: 28, escalated: 3, abandoned: 1 },
  { date: "Sun", resolved: 22, escalated: 2, abandoned: 1 },
];

const csatDistribution = [
  { score: "1 Star", count: 5 },
  { score: "2 Stars", count: 12 },
  { score: "3 Stars", count: 28 },
  { score: "4 Stars", count: 67 },
  { score: "5 Stars", count: 88 },
];

const handleTimeData = [
  { range: "<1m", count: 45 },
  { range: "1-3m", count: 82 },
  { range: "3-5m", count: 56 },
  { range: "5-10m", count: 34 },
  { range: "10-20m", count: 18 },
  { range: ">20m", count: 8 },
];

const agentPerformance = [
  { name: "Support Bot", sessions: 245, resolution: 91, csat: 4.5, avgTime: "3.2m" },
  { name: "Sales Bot", sessions: 132, resolution: 84, csat: 4.2, avgTime: "4.8m" },
  { name: "Billing Bot", sessions: 68, resolution: 88, csat: 4.1, avgTime: "5.1m" },
];

const topicTrends = [
  { week: "W1", orders: 45, returns: 22, billing: 15, technical: 12, account: 8 },
  { week: "W2", orders: 52, returns: 28, billing: 18, technical: 10, account: 11 },
  { week: "W3", orders: 48, returns: 31, billing: 12, technical: 14, account: 9 },
  { week: "W4", orders: 55, returns: 25, billing: 20, technical: 16, account: 13 },
];

export function AnalyticsDashboard() {
  const [period, setPeriod] = useState("7d");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {["24h", "7d", "30d", "90d"].map((p) => (
          <Button
            key={p}
            variant={period === p ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod(p)}
          >
            {p}
          </Button>
        ))}
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Resolution Rate" value="87%" change="+3.2% vs prev period" changeType="positive" icon={CheckCircle} />
        <StatCard title="Avg CSAT" value="4.3/5" change="+0.2 vs prev period" changeType="positive" icon={Star} />
        <StatCard title="Avg Handle Time" value="4.2 min" change="-0.8 min vs prev period" changeType="positive" icon={Clock} />
        <StatCard title="Escalation Rate" value="13%" change="-1.5% vs prev period" changeType="positive" icon={ArrowUpRight} />
      </div>

      {/* Resolution chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-brand-600" />
            Resolution Outcomes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={resolutionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="resolved" fill="#10b981" name="Resolved" radius={[2, 2, 0, 0]} />
              <Bar dataKey="escalated" fill="#f59e0b" name="Escalated" radius={[2, 2, 0, 0]} />
              <Bar dataKey="abandoned" fill="#ef4444" name="Abandoned" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* CSAT Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-brand-600" />
              CSAT Score Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={csatDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="score" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#4263eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Handle Time Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-brand-600" />
              Handle Time Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={handleTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Topic Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-brand-600" />
            Topic Trends (Weekly)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={topicTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="orders" stackId="1" stroke="#4263eb" fill="#4263eb" fillOpacity={0.6} name="Orders" />
              <Area type="monotone" dataKey="returns" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Returns" />
              <Area type="monotone" dataKey="billing" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Billing" />
              <Area type="monotone" dataKey="technical" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Technical" />
              <Area type="monotone" dataKey="account" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Account" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Agent Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-600" />
            Agent Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="pb-3 font-medium text-gray-500">Agent</th>
                  <th className="pb-3 font-medium text-gray-500">Sessions</th>
                  <th className="pb-3 font-medium text-gray-500">Resolution %</th>
                  <th className="pb-3 font-medium text-gray-500">CSAT</th>
                  <th className="pb-3 font-medium text-gray-500">Avg Time</th>
                </tr>
              </thead>
              <tbody>
                {agentPerformance.map((agent) => (
                  <tr key={agent.name} className="border-b border-gray-100">
                    <td className="py-3 font-medium text-gray-900">{agent.name}</td>
                    <td className="py-3 text-gray-700">{agent.sessions}</td>
                    <td className="py-3">
                      <span className={agent.resolution >= 90 ? "text-green-600" : agent.resolution >= 80 ? "text-yellow-600" : "text-red-600"}>
                        {agent.resolution}%
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-yellow-500" />
                        {agent.csat}
                      </div>
                    </td>
                    <td className="py-3 text-gray-700">{agent.avgTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
