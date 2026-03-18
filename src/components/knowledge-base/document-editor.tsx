"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import type { KnowledgeDocument } from "@/types/database";

interface DocumentEditorProps {
  document?: KnowledgeDocument;
  onSave: (data: Partial<KnowledgeDocument>) => Promise<void>;
  onCancel: () => void;
}

export function DocumentEditor({ document, onSave, onCancel }: DocumentEditorProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(document?.title || "");
  const [content, setContent] = useState(document?.content || "");
  const [docType, setDocType] = useState(document?.doc_type || "text");
  const [sourceUrl, setSourceUrl] = useState(document?.source_url || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        title,
        content,
        doc_type: docType as KnowledgeDocument["doc_type"],
        source_url: sourceUrl || null,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setContent(text);
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
    };
    reader.readAsText(file);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="docTitle"
          label="Document Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Return Policy"
          required
        />
        <Select
          id="docType"
          label="Document Type"
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          options={[
            { value: "text", label: "General Text" },
            { value: "faq", label: "FAQ" },
            { value: "policy", label: "Policy" },
            { value: "product", label: "Product Info" },
            { value: "url", label: "Web Content" },
          ]}
        />
      </div>

      <Input
        id="sourceUrl"
        label="Source URL (optional)"
        value={sourceUrl}
        onChange={(e) => setSourceUrl(e.target.value)}
        placeholder="https://..."
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Upload File (optional)
        </label>
        <input
          type="file"
          accept=".txt,.md,.csv,.json"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
        />
      </div>

      <Textarea
        id="content"
        label="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Paste or type your document content here..."
        rows={12}
        required
      />

      <div className="flex justify-end gap-3 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading} disabled={!title.trim() || !content.trim()}>
          {document ? "Update Document" : "Add Document"}
        </Button>
      </div>
    </form>
  );
}
