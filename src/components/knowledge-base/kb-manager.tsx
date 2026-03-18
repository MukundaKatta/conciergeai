"use client";

import { useState } from "react";
import { BookOpen, Plus, FileText, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { DocumentEditor } from "./document-editor";
import { useKnowledgeBases, useKnowledgeDocuments } from "@/hooks/use-knowledge-base";
import { DEMO_ORG } from "@/lib/store";
import type { KnowledgeBase } from "@/types/database";
import toast from "react-hot-toast";

export function KnowledgeBaseManager() {
  const { knowledgeBases, loading, createKB, deleteKB } = useKnowledgeBases(DEMO_ORG.id);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedKB, setSelectedKB] = useState<KnowledgeBase | null>(null);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const handleCreateKB = async () => {
    if (!newName.trim()) return;
    try {
      await createKB(newName, newDesc);
      setShowCreate(false);
      setNewName("");
      setNewDesc("");
      toast.success("Knowledge base created");
    } catch {
      toast.error("Failed to create knowledge base");
    }
  };

  const handleDeleteKB = async (kb: KnowledgeBase) => {
    if (!confirm(`Delete "${kb.name}" and all its documents?`)) return;
    try {
      await deleteKB(kb.id);
      toast.success("Knowledge base deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (selectedKB) {
    return <KBDocumentsView kb={selectedKB} onBack={() => setSelectedKB(null)} />;
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-5 w-32 rounded bg-gray-200" />
              <div className="mt-3 h-4 w-48 rounded bg-gray-200" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      {knowledgeBases.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No knowledge bases yet"
          description="Create a knowledge base and add documents for your AI agents to reference."
          action={
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Knowledge Base
            </Button>
          }
        />
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">{knowledgeBases.length} knowledge base{knowledgeBases.length !== 1 ? "s" : ""}</p>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Knowledge Base
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {knowledgeBases.map((kb) => (
              <Card
                key={kb.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => setSelectedKB(kb)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{kb.name}</h3>
                        {kb.description && (
                          <p className="mt-0.5 text-xs text-gray-500">{kb.description}</p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      Created {new Date(kb.created_at).toLocaleDateString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteKB(kb);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Knowledge Base"
      >
        <div className="space-y-4">
          <Input
            id="kbName"
            label="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g., Product Documentation"
          />
          <Textarea
            id="kbDesc"
            label="Description (optional)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="What kind of documents will be stored here?"
            rows={3}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreateKB} disabled={!newName.trim()}>Create</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function KBDocumentsView({ kb, onBack }: { kb: KnowledgeBase; onBack: () => void }) {
  const { documents, loading, addDocument, updateDocument, deleteDocument } = useKnowledgeDocuments(kb.id);
  const [showAddDoc, setShowAddDoc] = useState(false);

  const handleDeleteDoc = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await deleteDocument(id);
      toast.success("Document deleted");
    } catch {
      toast.error("Failed to delete document");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <button onClick={onBack} className="text-sm text-brand-600 hover:underline">
          &larr; Back to Knowledge Bases
        </button>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{kb.name}</h2>
            {kb.description && <p className="text-sm text-gray-500">{kb.description}</p>}
          </div>
          <Button onClick={() => setShowAddDoc(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Document
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-lg border p-4">
              <div className="h-4 w-48 rounded bg-gray-200" />
              <div className="mt-2 h-3 w-96 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Add documents, FAQs, or policies for your AI agents to reference."
          action={
            <Button onClick={() => setShowAddDoc(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Document
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <h4 className="font-medium text-gray-900">{doc.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Badge variant="outline" className="text-xs">
                        {doc.doc_type}
                      </Badge>
                      <span>{doc.content.length} chars</span>
                      <span>&middot;</span>
                      <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={doc.is_active ? "success" : "secondary"}>
                    {doc.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => handleDeleteDoc(doc.id, doc.title)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showAddDoc}
        onClose={() => setShowAddDoc(false)}
        title="Add Document"
        description="Add content to your knowledge base. The AI will chunk and index it for retrieval."
        size="lg"
      >
        <DocumentEditor
          onSave={async (data) => {
            await addDocument(data);
            setShowAddDoc(false);
            toast.success("Document added");
          }}
          onCancel={() => setShowAddDoc(false)}
        />
      </Modal>
    </div>
  );
}
