"use client";

import { AppShell } from "@/components/layout/app-shell";
import { AgentList } from "@/components/agents/agent-list";

export default function AgentsPage() {
  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">AI Agents</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure AI agents with custom brand voice, knowledge bases, and escalation rules.
        </p>
      </div>
      <AgentList />
    </AppShell>
  );
}
