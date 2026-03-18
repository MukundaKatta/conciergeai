"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import type { Agent, BrandVoice } from "@/types/database";
import { getAvailableActions } from "@/lib/ai/agent-actions";

interface AgentFormProps {
  agent?: Agent;
  onSubmit: (data: Partial<Agent>) => Promise<void>;
  onCancel: () => void;
}

export function AgentForm({ agent, onSubmit, onCancel }: AgentFormProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(agent?.name || "");
  const [description, setDescription] = useState(agent?.description || "");
  const [model, setModel] = useState(agent?.model || "gpt-4o-mini");
  const [temperature, setTemperature] = useState(agent?.temperature || 0.7);
  const [maxTokens, setMaxTokens] = useState(agent?.max_tokens || 1024);
  const [systemPrompt, setSystemPrompt] = useState(
    agent?.system_prompt || "You are a helpful customer service assistant. Be friendly, accurate, and concise."
  );
  const [greeting, setGreeting] = useState(agent?.greeting_message || "Hello! How can I help you today?");
  const [fallback, setFallback] = useState(
    agent?.fallback_message || "I apologize, but I cannot help with that. Let me connect you with a human agent."
  );
  const [tone, setTone] = useState<BrandVoice["tone"]>(agent?.brand_voice?.tone || "professional");
  const [formality, setFormality] = useState<BrandVoice["formality"]>(agent?.brand_voice?.formality || "semi-formal");
  const [personality, setPersonality] = useState<BrandVoice["personality"]>(agent?.brand_voice?.personality || "helpful");
  const [customInstructions, setCustomInstructions] = useState(agent?.brand_voice?.custom_instructions || "");
  const [selectedActions, setSelectedActions] = useState<string[]>(agent?.allowed_actions || []);

  const availableActions = getAvailableActions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        name,
        description,
        model,
        temperature,
        max_tokens: maxTokens,
        system_prompt: systemPrompt,
        greeting_message: greeting,
        fallback_message: fallback,
        brand_voice: {
          tone,
          formality,
          personality,
          custom_instructions: customInstructions || undefined,
        },
        allowed_actions: selectedActions,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAction = (actionType: string) => {
    setSelectedActions((prev) =>
      prev.includes(actionType)
        ? prev.filter((a) => a !== actionType)
        : [...prev, actionType]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-6 overflow-y-auto pr-2">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="name"
          label="Agent Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Support Bot"
          required
        />
        <Select
          id="model"
          label="AI Model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          options={[
            { value: "gpt-4o-mini", label: "GPT-4o Mini (Fast)" },
            { value: "gpt-4o", label: "GPT-4o (Smart)" },
            { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
          ]}
        />
      </div>

      <Textarea
        id="description"
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What does this agent do?"
        rows={2}
      />

      <Textarea
        id="systemPrompt"
        label="System Prompt"
        value={systemPrompt}
        onChange={(e) => setSystemPrompt(e.target.value)}
        placeholder="Instructions for the AI agent..."
        rows={4}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="greeting"
          label="Greeting Message"
          value={greeting}
          onChange={(e) => setGreeting(e.target.value)}
        />
        <Input
          id="fallback"
          label="Fallback Message"
          value={fallback}
          onChange={(e) => setFallback(e.target.value)}
        />
      </div>

      <div>
        <h4 className="mb-3 text-sm font-medium text-gray-700">Brand Voice</h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Select
            id="tone"
            label="Tone"
            value={tone}
            onChange={(e) => setTone(e.target.value as BrandVoice["tone"])}
            options={[
              { value: "professional", label: "Professional" },
              { value: "casual", label: "Casual" },
              { value: "friendly", label: "Friendly" },
              { value: "authoritative", label: "Authoritative" },
            ]}
          />
          <Select
            id="formality"
            label="Formality"
            value={formality}
            onChange={(e) => setFormality(e.target.value as BrandVoice["formality"])}
            options={[
              { value: "formal", label: "Formal" },
              { value: "semi-formal", label: "Semi-formal" },
              { value: "informal", label: "Informal" },
            ]}
          />
          <Select
            id="personality"
            label="Personality"
            value={personality}
            onChange={(e) => setPersonality(e.target.value as BrandVoice["personality"])}
            options={[
              { value: "helpful", label: "Helpful" },
              { value: "witty", label: "Witty" },
              { value: "empathetic", label: "Empathetic" },
              { value: "direct", label: "Direct" },
            ]}
          />
        </div>
        <div className="mt-3">
          <Textarea
            id="customInstructions"
            label="Custom Voice Instructions (optional)"
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="e.g., Always refer to customers by first name, use British English spelling..."
            rows={2}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Temperature: {temperature}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>Precise</span>
            <span>Creative</span>
          </div>
        </div>
        <Input
          id="maxTokens"
          label="Max Response Tokens"
          type="number"
          value={maxTokens}
          onChange={(e) => setMaxTokens(parseInt(e.target.value))}
          min={128}
          max={4096}
        />
      </div>

      <div>
        <h4 className="mb-3 text-sm font-medium text-gray-700">Allowed Actions</h4>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {availableActions.map((action) => (
            <label
              key={action.type}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={selectedActions.includes(action.type)}
                onChange={() => toggleAction(action.type)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {action.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </p>
                <p className="text-xs text-gray-500">{action.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {agent ? "Update Agent" : "Create Agent"}
        </Button>
      </div>
    </form>
  );
}
