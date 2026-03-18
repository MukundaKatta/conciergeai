"use client";

import { useState, useCallback } from "react";
import {
  Plus,
  Trash2,
  MessageSquare,
  HelpCircle,
  GitBranch,
  Zap,
  Bot,
  AlertTriangle,
  Play,
  Square,
  Save,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import type { FlowNode, FlowEdge, FlowNodeType, FlowNodeContent } from "@/types/database";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface LocalNode extends Omit<FlowNode, "flow_id" | "created_at"> {
  tempId: string;
}

interface LocalEdge {
  tempId: string;
  sourceId: string;
  targetId: string;
  label: string;
}

const NODE_TYPES: { type: FlowNodeType; label: string; icon: typeof MessageSquare; color: string }[] = [
  { type: "start", label: "Start", icon: Play, color: "bg-green-100 text-green-700" },
  { type: "message", label: "Message", icon: MessageSquare, color: "bg-blue-100 text-blue-700" },
  { type: "question", label: "Question", icon: HelpCircle, color: "bg-purple-100 text-purple-700" },
  { type: "condition", label: "Condition", icon: GitBranch, color: "bg-yellow-100 text-yellow-700" },
  { type: "action", label: "Action", icon: Zap, color: "bg-orange-100 text-orange-700" },
  { type: "ai_fallback", label: "AI Fallback", icon: Bot, color: "bg-brand-100 text-brand-700" },
  { type: "escalate", label: "Escalate", icon: AlertTriangle, color: "bg-red-100 text-red-700" },
  { type: "end", label: "End", icon: Square, color: "bg-gray-100 text-gray-700" },
];

export function FlowDesigner() {
  const [flowName, setFlowName] = useState("New Conversation Flow");
  const [flowDescription, setFlowDescription] = useState("");
  const [triggerKeywords, setTriggerKeywords] = useState("");
  const [nodes, setNodes] = useState<LocalNode[]>([
    {
      id: crypto.randomUUID(),
      tempId: "start-1",
      node_type: "start",
      label: "Start",
      content: { text: "Conversation begins" },
      position_x: 400,
      position_y: 50,
    },
  ]);
  const [edges, setEdges] = useState<LocalEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<LocalNode | null>(null);
  const [showNodePicker, setShowNodePicker] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  const addNode = useCallback((type: FlowNodeType) => {
    const newNode: LocalNode = {
      id: crypto.randomUUID(),
      tempId: `node-${Date.now()}`,
      node_type: type,
      label: NODE_TYPES.find((n) => n.type === type)?.label || type,
      content: getDefaultContent(type),
      position_x: 200 + Math.random() * 400,
      position_y: nodes.length * 120 + 100,
    };
    setNodes((prev) => [...prev, newNode]);
    setShowNodePicker(false);
    setSelectedNode(newNode);
  }, [nodes.length]);

  const updateNode = (id: string, updates: Partial<LocalNode>) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)));
    if (selectedNode?.id === id) {
      setSelectedNode((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const deleteNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.sourceId !== id && e.targetId !== id));
    if (selectedNode?.id === id) setSelectedNode(null);
  };

  const connectNodes = (targetId: string) => {
    if (!connectingFrom || connectingFrom === targetId) {
      setConnectingFrom(null);
      return;
    }
    const exists = edges.some(
      (e) => e.sourceId === connectingFrom && e.targetId === targetId
    );
    if (!exists) {
      setEdges((prev) => [
        ...prev,
        { tempId: `edge-${Date.now()}`, sourceId: connectingFrom, targetId, label: "" },
      ]);
    }
    setConnectingFrom(null);
  };

  const deleteEdge = (tempId: string) => {
    setEdges((prev) => prev.filter((e) => e.tempId !== tempId));
  };

  const handleSave = async () => {
    toast.success("Flow saved (connect to Supabase to persist)");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input
          id="flowName"
          label="Flow Name"
          value={flowName}
          onChange={(e) => setFlowName(e.target.value)}
        />
        <Input
          id="flowDesc"
          label="Description"
          value={flowDescription}
          onChange={(e) => setFlowDescription(e.target.value)}
          placeholder="Optional description"
        />
        <Input
          id="triggers"
          label="Trigger Keywords (comma-separated)"
          value={triggerKeywords}
          onChange={(e) => setTriggerKeywords(e.target.value)}
          placeholder="e.g., return, refund, send back"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={() => setShowNodePicker(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Add Node
        </Button>
        <Button variant="outline" onClick={handleSave}>
          <Save className="mr-1.5 h-4 w-4" /> Save Flow
        </Button>
        {connectingFrom && (
          <Badge variant="warning">
            Click a target node to connect, or click empty space to cancel
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Flow Canvas */}
        <div
          className="lg:col-span-2 min-h-[500px] rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 overflow-auto"
          onClick={() => {
            if (connectingFrom) setConnectingFrom(null);
          }}
        >
          {nodes.length <= 1 ? (
            <EmptyState
              icon={GitBranch}
              title="Design your flow"
              description="Add nodes to create a conversation decision tree. Connect nodes to define the flow."
            />
          ) : null}

          <div className="space-y-4">
            {nodes.map((node) => {
              const typeInfo = NODE_TYPES.find((t) => t.type === node.node_type);
              const Icon = typeInfo?.icon || MessageSquare;
              const outgoing = edges.filter((e) => e.sourceId === node.id);
              const incoming = edges.filter((e) => e.targetId === node.id);

              return (
                <div key={node.id} className="relative">
                  {/* Incoming edges */}
                  {incoming.length > 0 && (
                    <div className="mb-1 flex items-center gap-1 pl-8 text-xs text-gray-400">
                      {incoming.map((e) => {
                        const sourceNode = nodes.find((n) => n.id === e.sourceId);
                        return (
                          <span key={e.tempId} className="flex items-center gap-1">
                            <ArrowRight className="h-3 w-3" />
                            from {sourceNode?.label}
                            <button
                              onClick={() => deleteEdge(e.tempId)}
                              className="ml-1 text-red-400 hover:text-red-600"
                            >
                              x
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <div
                    className={cn(
                      "flex items-start gap-3 rounded-lg border-2 bg-white p-4 transition-all cursor-pointer",
                      selectedNode?.id === node.id
                        ? "border-brand-500 shadow-md"
                        : "border-gray-200 hover:border-gray-300",
                      connectingFrom === node.id && "ring-2 ring-blue-400",
                      connectingFrom && connectingFrom !== node.id && "border-dashed border-blue-300"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (connectingFrom && connectingFrom !== node.id) {
                        connectNodes(node.id);
                      } else {
                        setSelectedNode(node);
                      }
                    }}
                  >
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", typeInfo?.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{node.label}</h4>
                        <Badge variant="outline" className="text-xs">{node.node_type}</Badge>
                      </div>
                      {node.content.text && (
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{node.content.text}</p>
                      )}
                      {node.content.options && node.content.options.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {node.content.options.map((opt, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {opt.label}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConnectingFrom(node.id);
                        }}
                        className="rounded p-1 text-blue-500 hover:bg-blue-50"
                        title="Connect to another node"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      {node.node_type !== "start" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNode(node.id);
                          }}
                          className="rounded p-1 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Outgoing edges */}
                  {outgoing.length > 0 && (
                    <div className="ml-8 mt-1 flex flex-wrap gap-1 text-xs text-gray-400">
                      {outgoing.map((e) => {
                        const targetNode = nodes.find((n) => n.id === e.targetId);
                        return (
                          <span key={e.tempId} className="flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5">
                            <ArrowRight className="h-3 w-3" />
                            {e.label || "to"} {targetNode?.label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Node Editor */}
        <div>
          {selectedNode ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Edit Node</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  id="nodeLabel"
                  label="Label"
                  value={selectedNode.label}
                  onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })}
                />
                {(selectedNode.node_type === "message" || selectedNode.node_type === "question") && (
                  <Textarea
                    id="nodeText"
                    label="Text"
                    value={selectedNode.content.text || ""}
                    onChange={(e) =>
                      updateNode(selectedNode.id, {
                        content: { ...selectedNode.content, text: e.target.value },
                      })
                    }
                    rows={4}
                  />
                )}
                {selectedNode.node_type === "question" && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Options (one per line, format: label|value)
                    </label>
                    <Textarea
                      value={
                        selectedNode.content.options
                          ?.map((o) => `${o.label}|${o.value}`)
                          .join("\n") || ""
                      }
                      onChange={(e) => {
                        const options = e.target.value
                          .split("\n")
                          .filter((l) => l.trim())
                          .map((l) => {
                            const [label, value] = l.split("|");
                            return { label: label.trim(), value: (value || label).trim() };
                          });
                        updateNode(selectedNode.id, {
                          content: { ...selectedNode.content, options },
                        });
                      }}
                      rows={4}
                      placeholder="Yes|yes&#10;No|no&#10;Maybe later|later"
                    />
                  </div>
                )}
                {selectedNode.node_type === "condition" && (
                  <div className="space-y-3">
                    <Input
                      label="Condition Field"
                      value={selectedNode.content.condition_field || ""}
                      onChange={(e) =>
                        updateNode(selectedNode.id, {
                          content: { ...selectedNode.content, condition_field: e.target.value },
                        })
                      }
                      placeholder="e.g., order_status"
                    />
                    <Select
                      label="Operator"
                      value={selectedNode.content.condition_operator || "equals"}
                      onChange={(e) =>
                        updateNode(selectedNode.id, {
                          content: {
                            ...selectedNode.content,
                            condition_operator: e.target.value as FlowNodeContent["condition_operator"],
                          },
                        })
                      }
                      options={[
                        { value: "equals", label: "Equals" },
                        { value: "contains", label: "Contains" },
                        { value: "greater_than", label: "Greater Than" },
                        { value: "less_than", label: "Less Than" },
                      ]}
                    />
                    <Input
                      label="Value"
                      value={selectedNode.content.condition_value || ""}
                      onChange={(e) =>
                        updateNode(selectedNode.id, {
                          content: { ...selectedNode.content, condition_value: e.target.value },
                        })
                      }
                    />
                  </div>
                )}
                {selectedNode.node_type === "action" && (
                  <Select
                    label="Action Type"
                    value={selectedNode.content.action_type || ""}
                    onChange={(e) =>
                      updateNode(selectedNode.id, {
                        content: { ...selectedNode.content, action_type: e.target.value },
                      })
                    }
                    options={[
                      { value: "", label: "Select action..." },
                      { value: "process_return", label: "Process Return" },
                      { value: "check_order_status", label: "Check Order Status" },
                      { value: "update_account", label: "Update Account" },
                      { value: "schedule_callback", label: "Schedule Callback" },
                      { value: "lookup_product", label: "Lookup Product" },
                      { value: "apply_discount", label: "Apply Discount" },
                      { value: "cancel_order", label: "Cancel Order" },
                    ]}
                  />
                )}
                {selectedNode.node_type === "ai_fallback" && (
                  <Textarea
                    label="Fallback context (additional instructions for AI)"
                    value={selectedNode.content.text || ""}
                    onChange={(e) =>
                      updateNode(selectedNode.id, {
                        content: { ...selectedNode.content, text: e.target.value },
                      })
                    }
                    rows={4}
                    placeholder="Use AI to handle questions that don't match the flow..."
                  />
                )}
                {selectedNode.node_type === "escalate" && (
                  <Textarea
                    label="Escalation message"
                    value={selectedNode.content.text || ""}
                    onChange={(e) =>
                      updateNode(selectedNode.id, {
                        content: { ...selectedNode.content, text: e.target.value },
                      })
                    }
                    rows={3}
                    placeholder="Let me connect you with a human agent..."
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-sm text-gray-500">
                Select a node to edit its properties.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Node Picker Modal */}
      <Modal
        isOpen={showNodePicker}
        onClose={() => setShowNodePicker(false)}
        title="Add Node"
        description="Choose a node type for your conversation flow."
      >
        <div className="grid grid-cols-2 gap-3">
          {NODE_TYPES.filter((t) => t.type !== "start").map((type) => (
            <button
              key={type.type}
              onClick={() => addNode(type.type)}
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 text-left transition-colors hover:bg-gray-50"
            >
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", type.color)}>
                <type.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-gray-900">{type.label}</span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}

function getDefaultContent(type: FlowNodeType): FlowNodeContent {
  switch (type) {
    case "start":
      return { text: "Conversation begins" };
    case "message":
      return { text: "" };
    case "question":
      return { text: "", options: [] };
    case "condition":
      return { condition_field: "", condition_operator: "equals", condition_value: "" };
    case "action":
      return { action_type: "" };
    case "ai_fallback":
      return { text: "Use AI to handle this part of the conversation." };
    case "escalate":
      return { text: "Let me connect you with a human agent who can better assist you." };
    case "end":
      return { text: "Thank you for contacting us!" };
    default:
      return {};
  }
}
