"use client";

import { AppShell } from "@/components/layout/app-shell";
import { ABTestManager } from "@/components/ab-testing/ab-test-manager";

export default function ABTestingPage() {
  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">A/B Testing</h1>
        <p className="mt-1 text-sm text-gray-500">
          Test different agent configurations to optimize customer experience metrics.
        </p>
      </div>
      <ABTestManager />
    </AppShell>
  );
}
