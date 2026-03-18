"use client";

import { AppShell } from "@/components/layout/app-shell";
import { QADashboard } from "@/components/qa/qa-dashboard";

export default function QualityAssurancePage() {
  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Quality Assurance</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review random conversations, score agent performance, and flag issues.
        </p>
      </div>
      <QADashboard />
    </AppShell>
  );
}
