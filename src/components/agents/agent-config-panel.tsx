"use client";

import { useState } from "react";
import { X, Plus, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import { AgentForm } from "./agent-form";
import type { Agent, EscalationRule, WidgetConfig } from "@/types/database";
import { cn } from "@/lib/utils";

interface AgentConfigPanelProps {
  agent: Agent;
  onClose: () => void;
  onUpdate: (updates: Partial<Agent>) => Promise<void>;
}

export function AgentConfigPanel({ agent, onClose, onUpdate }: AgentConfigPanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative ml-auto flex h-full w-full max-w-3xl flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold">Configure: {agent.name}</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <Tabs
            tabs={[
              { id: "general", label: "General" },
              { id: "escalation", label: "Escalation Rules" },
              { id: "widget", label: "Widget Config" },
              { id: "embed", label: "Embed Code" },
            ]}
          >
            {(activeTab) => (
              <>
                {activeTab === "general" && (
                  <AgentForm agent={agent} onSubmit={onUpdate} onCancel={onClose} />
                )}
                {activeTab === "escalation" && (
                  <EscalationRulesEditor
                    rules={agent.escalation_rules}
                    onSave={(rules) => onUpdate({ escalation_rules: rules })}
                  />
                )}
                {activeTab === "widget" && (
                  <WidgetConfigEditor
                    config={agent.widget_config}
                    onSave={(config) => onUpdate({ widget_config: config })}
                  />
                )}
                {activeTab === "embed" && (
                  <EmbedCodeSection agentId={agent.id} />
                )}
              </>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function EscalationRulesEditor({
  rules,
  onSave,
}: {
  rules: EscalationRule[];
  onSave: (rules: EscalationRule[]) => Promise<void>;
}) {
  const [localRules, setLocalRules] = useState<EscalationRule[]>(rules);
  const [saving, setSaving] = useState(false);

  const addRule = () => {
    setLocalRules((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        trigger: "keyword",
        condition: "",
        priority: "normal",
        message: "",
      },
    ]);
  };

  const updateRule = (id: string, updates: Partial<EscalationRule>) => {
    setLocalRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const removeRule = (id: string) => {
    setLocalRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(localRules);
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Define rules for when conversations should be escalated to a human agent.
      </p>

      {localRules.map((rule) => (
        <div key={rule.id} className="rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Select
              id={`trigger-${rule.id}`}
              label="Trigger"
              value={rule.trigger}
              onChange={(e) => updateRule(rule.id, { trigger: e.target.value as EscalationRule["trigger"] })}
              options={[
                { value: "keyword", label: "Keyword Match" },
                { value: "sentiment", label: "Sentiment" },
                { value: "repeated_failure", label: "Repeated Failures" },
                { value: "explicit_request", label: "Explicit Request" },
                { value: "timeout", label: "Timeout" },
              ]}
            />
            <Input
              id={`condition-${rule.id}`}
              label="Condition"
              value={rule.condition}
              onChange={(e) => updateRule(rule.id, { condition: e.target.value })}
              placeholder={
                rule.trigger === "keyword"
                  ? "angry, lawsuit, complaint"
                  : rule.trigger === "sentiment"
                  ? "negative"
                  : rule.trigger === "repeated_failure"
                  ? "3"
                  : "auto-detected"
              }
            />
            <Select
              id={`priority-${rule.id}`}
              label="Priority"
              value={rule.priority}
              onChange={(e) => updateRule(rule.id, { priority: e.target.value as EscalationRule["priority"] })}
              options={[
                { value: "low", label: "Low" },
                { value: "normal", label: "Normal" },
                { value: "high", label: "High" },
                { value: "urgent", label: "Urgent" },
              ]}
            />
          </div>
          <div className="mt-3 flex items-end gap-3">
            <div className="flex-1">
              <Input
                id={`message-${rule.id}`}
                label="Custom Message (optional)"
                value={rule.message || ""}
                onChange={(e) => updateRule(rule.id, { message: e.target.value })}
                placeholder="Message to show when escalating..."
              />
            </div>
            <Button variant="ghost" size="icon" onClick={() => removeRule(rule.id)} className="text-red-500">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={addRule}>
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Rule
        </Button>
        <Button onClick={handleSave} loading={saving}>
          Save Rules
        </Button>
      </div>
    </div>
  );
}

function WidgetConfigEditor({
  config,
  onSave,
}: {
  config: WidgetConfig;
  onSave: (config: WidgetConfig) => Promise<void>;
}) {
  const [localConfig, setLocalConfig] = useState<WidgetConfig>(config);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(localConfig);
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">Customize the appearance of the embeddable chat widget.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Primary Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={localConfig.primaryColor}
              onChange={(e) => setLocalConfig({ ...localConfig, primaryColor: e.target.value })}
              className="h-10 w-14 cursor-pointer rounded border border-gray-300"
            />
            <Input
              value={localConfig.primaryColor}
              onChange={(e) => setLocalConfig({ ...localConfig, primaryColor: e.target.value })}
            />
          </div>
        </div>
        <Select
          id="position"
          label="Widget Position"
          value={localConfig.position}
          onChange={(e) => setLocalConfig({ ...localConfig, position: e.target.value as WidgetConfig["position"] })}
          options={[
            { value: "bottom-right", label: "Bottom Right" },
            { value: "bottom-left", label: "Bottom Left" },
          ]}
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Border Radius: {localConfig.borderRadius}px
          </label>
          <input
            type="range"
            min="0"
            max="24"
            value={localConfig.borderRadius}
            onChange={(e) => setLocalConfig({ ...localConfig, borderRadius: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
        <Input
          id="headerText"
          label="Header Text"
          value={localConfig.headerText || ""}
          onChange={(e) => setLocalConfig({ ...localConfig, headerText: e.target.value })}
          placeholder="Chat with us"
        />
      </div>

      {/* Widget Preview */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-gray-700">Preview</h4>
        <div className="flex justify-center rounded-lg bg-gray-100 p-8">
          <div
            className="w-80 overflow-hidden bg-white shadow-lg"
            style={{ borderRadius: `${localConfig.borderRadius}px` }}
          >
            <div
              className="flex items-center gap-2 p-4 text-white"
              style={{ backgroundColor: localConfig.primaryColor }}
            >
              <div className="h-8 w-8 rounded-full bg-white/20" />
              <span className="font-medium">{localConfig.headerText || "Chat with us"}</span>
            </div>
            <div className="space-y-3 p-4">
              <div className="flex justify-start">
                <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm">
                  Hello! How can I help you?
                </div>
              </div>
              <div className="flex justify-end">
                <div
                  className="rounded-lg px-3 py-2 text-sm text-white"
                  style={{ backgroundColor: localConfig.primaryColor }}
                >
                  I need help with my order
                </div>
              </div>
            </div>
            <div className="border-t p-3">
              <div className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-400">
                Type a message...
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving}>
          Save Widget Config
        </Button>
      </div>
    </div>
  );
}

function EmbedCodeSection({ agentId }: { agentId: string }) {
  const [copied, setCopied] = useState(false);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://your-conciergeai-domain.com";

  const embedCode = `<script>
  (function() {
    var s = document.createElement('script');
    s.src = '${appUrl}/widget.js';
    s.async = true;
    s.dataset.agentId = '${agentId}';
    document.head.appendChild(s);
  })();
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Add this code snippet to your website to embed the chat widget.
      </p>

      <div className="relative">
        <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
          {embedCode}
        </pre>
        <Button
          variant="secondary"
          size="sm"
          className="absolute right-3 top-3"
          onClick={handleCopy}
        >
          <Copy className="mr-1.5 h-3.5 w-3.5" />
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>

      <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
        <strong>API Endpoint:</strong> You can also integrate via the REST API at{" "}
        <code className="rounded bg-blue-100 px-1.5 py-0.5 text-xs">{appUrl}/api/chat/{agentId}</code>
      </div>
    </div>
  );
}
