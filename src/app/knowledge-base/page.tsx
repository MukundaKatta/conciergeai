"use client";

import { AppShell } from "@/components/layout/app-shell";
import { KnowledgeBaseManager } from "@/components/knowledge-base/kb-manager";

export default function KnowledgeBasePage() {
  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload product docs, FAQs, and policies. AI agents use this knowledge to answer questions accurately.
        </p>
      </div>
      <KnowledgeBaseManager />
    </AppShell>
  );
}
