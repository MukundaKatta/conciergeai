"use client";

import { useState } from "react";
import { Bot, Plus, Settings, Trash2, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { AgentForm } from "./agent-form";
import { AgentConfigPanel } from "./agent-config-panel";
import { useAgents } from "@/hooks/use-agents";
import { DEMO_ORG } from "@/lib/store";
import type { Agent } from "@/types/database";
import toast from "react-hot-toast";

export function AgentList() {
  const { agents, loading, createAgent, updateAgent, deleteAgent } = useAgents(DEMO_ORG.id);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const handleCreate = async (data: Partial<Agent>) => {
    try {
      await createAgent(data);
      setShowCreateModal(false);
      toast.success("Agent created successfully");
    } catch (err) {
      toast.error("Failed to create agent");
    }
  };

  const handleToggleActive = async (agent: Agent) => {
    try {
      await updateAgent(agent.id, { is_active: !agent.is_active });
      toast.success(`Agent ${agent.is_active ? "deactivated" : "activated"}`);
    } catch {
      toast.error("Failed to update agent");
    }
  };

  const handleDelete = async (agent: Agent) => {
    if (!confirm(`Are you sure you want to delete "${agent.name}"?`)) return;
    try {
      await deleteAgent(agent.id);
      toast.success("Agent deleted");
    } catch {
      toast.error("Failed to delete agent");
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-12 w-12 rounded-full bg-gray-200" />
              <div className="mt-4 h-4 w-32 rounded bg-gray-200" />
              <div className="mt-2 h-3 w-48 rounded bg-gray-200" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <>
        <EmptyState
          icon={Bot}
          title="No agents yet"
          description="Create your first AI agent to start handling customer conversations automatically."
          action={
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Agent
            </Button>
          }
        />
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Agent"
          description="Configure your AI agent's personality, capabilities, and behavior."
          size="lg"
        >
          <AgentForm onSubmit={handleCreate} onCancel={() => setShowCreateModal(false)} />
        </Modal>
      </>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-500">{agents.length} agent{agents.length !== 1 ? "s" : ""}</p>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Agent
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <Card key={agent.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
                    <Bot className="h-6 w-6 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                    <p className="text-xs text-gray-500">{agent.model}</p>
                  </div>
                </div>
                <Badge variant={agent.is_active ? "success" : "secondary"}>
                  {agent.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>

              {agent.description && (
                <p className="mt-3 text-sm text-gray-600 line-clamp-2">{agent.description}</p>
              )}

              <div className="mt-4 flex flex-wrap gap-1.5">
                <Badge variant="outline">{agent.brand_voice.tone}</Badge>
                <Badge variant="outline">{agent.brand_voice.personality}</Badge>
                {agent.allowed_actions.length > 0 && (
                  <Badge variant="outline">{agent.allowed_actions.length} actions</Badge>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAgent(agent)}
                >
                  <Settings className="mr-1.5 h-3.5 w-3.5" /> Configure
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleActive(agent)}
                >
                  {agent.is_active ? (
                    <><PowerOff className="mr-1.5 h-3.5 w-3.5" /> Disable</>
                  ) : (
                    <><Power className="mr-1.5 h-3.5 w-3.5" /> Enable</>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleDelete(agent)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Agent"
        description="Configure your AI agent's personality, capabilities, and behavior."
        size="lg"
      >
        <AgentForm onSubmit={handleCreate} onCancel={() => setShowCreateModal(false)} />
      </Modal>

      {selectedAgent && (
        <AgentConfigPanel
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
          onUpdate={async (updates) => {
            await updateAgent(selectedAgent.id, updates);
            setSelectedAgent(null);
            toast.success("Agent updated");
          }}
        />
      )}
    </>
  );
}
