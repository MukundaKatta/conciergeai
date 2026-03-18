"use client";

import { useState } from "react";
import {
  FlaskConical,
  Plus,
  Play,
  Pause,
  CheckCircle,
  Trash2,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { statusColor } from "@/lib/utils";
import type { ABTest, ABTestVariant } from "@/types/database";
import toast from "react-hot-toast";

// Demo data
const demoTests: ABTest[] = [
  {
    id: "1",
    org_id: "demo",
    name: "Tone Comparison",
    description: "Compare professional vs friendly tone on resolution rate",
    status: "running",
    variants: [
      { id: "v1", name: "Professional Tone", agent_id: "a1", description: "Formal, business-like communication" },
      { id: "v2", name: "Friendly Tone", agent_id: "a2", description: "Casual, approachable communication" },
    ],
    traffic_split: { v1: 50, v2: 50 },
    metric_goals: { primary: "resolution_rate", secondary: "csat_score" },
    started_at: "2026-03-10T00:00:00Z",
    ended_at: null,
    created_at: "2026-03-09T00:00:00Z",
  },
  {
    id: "2",
    org_id: "demo",
    name: "Greeting Message Test",
    description: "Test different greeting messages on engagement",
    status: "completed",
    variants: [
      { id: "v3", name: "Standard Greeting", agent_id: "a1" },
      { id: "v4", name: "Personalized Greeting", agent_id: "a3" },
    ],
    traffic_split: { v3: 50, v4: 50 },
    metric_goals: { primary: "engagement_rate" },
    started_at: "2026-02-15T00:00:00Z",
    ended_at: "2026-03-01T00:00:00Z",
    created_at: "2026-02-14T00:00:00Z",
  },
];

const demoResults: Record<string, { variant: string; sessions: number; resolution: number; csat: number; avgTime: string }[]> = {
  "1": [
    { variant: "Professional Tone", sessions: 124, resolution: 88, csat: 4.2, avgTime: "3.8m" },
    { variant: "Friendly Tone", sessions: 118, resolution: 92, csat: 4.6, avgTime: "4.1m" },
  ],
  "2": [
    { variant: "Standard Greeting", sessions: 256, resolution: 85, csat: 4.1, avgTime: "4.5m" },
    { variant: "Personalized Greeting", sessions: 248, resolution: 89, csat: 4.4, avgTime: "4.2m" },
  ],
};

export function ABTestManager() {
  const [tests, setTests] = useState<ABTest[]>(demoTests);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newVariants, setNewVariants] = useState<{ name: string; description: string }[]>([
    { name: "Variant A", description: "" },
    { name: "Variant B", description: "" },
  ]);

  const handleCreate = () => {
    const test: ABTest = {
      id: crypto.randomUUID(),
      org_id: "demo",
      name: newName,
      description: newDesc,
      status: "draft",
      variants: newVariants.map((v, i) => ({
        id: `v-${Date.now()}-${i}`,
        name: v.name,
        agent_id: "",
        description: v.description,
      })),
      traffic_split: Object.fromEntries(
        newVariants.map((_, i) => [`v-${Date.now()}-${i}`, Math.floor(100 / newVariants.length)])
      ),
      metric_goals: { primary: "resolution_rate" },
      started_at: null,
      ended_at: null,
      created_at: new Date().toISOString(),
    };

    setTests((prev) => [test, ...prev]);
    setShowCreate(false);
    setNewName("");
    setNewDesc("");
    setNewVariants([
      { name: "Variant A", description: "" },
      { name: "Variant B", description: "" },
    ]);
    toast.success("A/B test created");
  };

  const toggleStatus = (test: ABTest) => {
    const newStatus = test.status === "running" ? "paused" : test.status === "paused" ? "running" : test.status === "draft" ? "running" : test.status;
    setTests((prev) =>
      prev.map((t) =>
        t.id === test.id
          ? {
              ...t,
              status: newStatus as ABTest["status"],
              started_at: newStatus === "running" && !t.started_at ? new Date().toISOString() : t.started_at,
            }
          : t
      )
    );
    toast.success(`Test ${newStatus}`);
  };

  const completeTest = (test: ABTest) => {
    setTests((prev) =>
      prev.map((t) =>
        t.id === test.id
          ? { ...t, status: "completed" as ABTest["status"], ended_at: new Date().toISOString() }
          : t
      )
    );
    toast.success("Test completed");
  };

  const deleteTest = (id: string) => {
    setTests((prev) => prev.filter((t) => t.id !== id));
    toast.success("Test deleted");
  };

  return (
    <>
      {tests.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title="No A/B tests yet"
          description="Create an A/B test to compare different agent configurations."
          action={
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Test
            </Button>
          }
        />
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">{tests.length} test{tests.length !== 1 ? "s" : ""}</p>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Test
            </Button>
          </div>

          <div className="space-y-4">
            {tests.map((test) => (
              <Card key={test.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{test.name}</h3>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(test.status)}`}>
                          {test.status}
                        </span>
                      </div>
                      {test.description && (
                        <p className="mt-1 text-sm text-gray-500">{test.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {test.status !== "completed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleStatus(test)}
                        >
                          {test.status === "running" ? (
                            <><Pause className="mr-1.5 h-3.5 w-3.5" /> Pause</>
                          ) : (
                            <><Play className="mr-1.5 h-3.5 w-3.5" /> Start</>
                          )}
                        </Button>
                      )}
                      {test.status === "running" && (
                        <Button variant="outline" size="sm" onClick={() => completeTest(test)}>
                          <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Complete
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTest(test)}
                      >
                        <BarChart3 className="mr-1.5 h-3.5 w-3.5" /> Results
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => deleteTest(test.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-4">
                    {test.variants.map((variant, i) => (
                      <div key={variant.id} className="flex items-center gap-2">
                        {i > 0 && <span className="text-gray-300">vs</span>}
                        <div className="rounded-lg border border-gray-200 px-3 py-2">
                          <p className="text-sm font-medium text-gray-900">{variant.name}</p>
                          {variant.description && (
                            <p className="text-xs text-gray-500">{variant.description}</p>
                          )}
                          <Badge variant="outline" className="mt-1 text-xs">
                            {test.traffic_split[variant.id] || 50}% traffic
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  {test.started_at && (
                    <p className="mt-3 text-xs text-gray-400">
                      Started: {new Date(test.started_at).toLocaleDateString()}
                      {test.ended_at && ` | Ended: ${new Date(test.ended_at).toLocaleDateString()}`}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create A/B Test"
        description="Define variants to test different agent configurations."
        size="lg"
      >
        <div className="space-y-4">
          <Input
            id="testName"
            label="Test Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g., Tone Comparison"
          />
          <Textarea
            id="testDesc"
            label="Description"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="What are you testing?"
            rows={2}
          />
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Variants</label>
            <div className="space-y-3">
              {newVariants.map((v, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <Input
                      value={v.name}
                      onChange={(e) => {
                        const updated = [...newVariants];
                        updated[i] = { ...v, name: e.target.value };
                        setNewVariants(updated);
                      }}
                      placeholder="Variant name"
                    />
                    <Input
                      value={v.description}
                      onChange={(e) => {
                        const updated = [...newVariants];
                        updated[i] = { ...v, description: e.target.value };
                        setNewVariants(updated);
                      }}
                      placeholder="Description (optional)"
                    />
                  </div>
                  {newVariants.length > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => setNewVariants((prev) => prev.filter((_, j) => j !== i))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNewVariants((prev) => [...prev, { name: `Variant ${String.fromCharCode(65 + prev.length)}`, description: "" }])}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Variant
              </Button>
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newName.trim()}>Create Test</Button>
          </div>
        </div>
      </Modal>

      {/* Results Modal */}
      {selectedTest && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTest(null)}
          title={`Results: ${selectedTest.name}`}
          size="lg"
        >
          <div className="space-y-4">
            {(demoResults[selectedTest.id] || []).length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">
                No results yet. Start the test and wait for data to accumulate.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 font-medium text-gray-500">Variant</th>
                      <th className="pb-2 font-medium text-gray-500">Sessions</th>
                      <th className="pb-2 font-medium text-gray-500">Resolution %</th>
                      <th className="pb-2 font-medium text-gray-500">CSAT</th>
                      <th className="pb-2 font-medium text-gray-500">Avg Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(demoResults[selectedTest.id] || []).map((row) => (
                      <tr key={row.variant} className="border-b border-gray-100">
                        <td className="py-3 font-medium">{row.variant}</td>
                        <td className="py-3">{row.sessions}</td>
                        <td className="py-3">
                          <Badge variant={row.resolution >= 90 ? "success" : "warning"}>
                            {row.resolution}%
                          </Badge>
                        </td>
                        <td className="py-3">{row.csat}/5</td>
                        <td className="py-3">{row.avgTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
