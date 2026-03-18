"use client";

import { AppShell } from "@/components/layout/app-shell";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";

export default function AnalyticsPage() {
  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track resolution rates, CSAT scores, average handle time, and common topics.
        </p>
      </div>
      <AnalyticsDashboard />
    </AppShell>
  );
}
