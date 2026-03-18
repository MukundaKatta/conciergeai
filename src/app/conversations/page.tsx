"use client";

import { AppShell } from "@/components/layout/app-shell";
import { ConversationManager } from "@/components/conversations/conversation-manager";

export default function ConversationsPage() {
  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Conversations</h1>
        <p className="mt-1 text-sm text-gray-500">
          View active and past conversations. Design conversation flows with decision trees.
        </p>
      </div>
      <ConversationManager />
    </AppShell>
  );
}
