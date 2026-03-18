"use client";

import { AppShell } from "@/components/layout/app-shell";
import { DashboardOverview } from "@/components/analytics/dashboard-overview";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor your AI agents' performance and customer experience metrics.
        </p>
      </div>
      <DashboardOverview />
    </AppShell>
  );
}
