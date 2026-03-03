"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase, type Document } from "@/lib/supabase";
import { Trash2 } from "lucide-react";

interface DocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document?: Document | null;
  onSaved: () => void;
}

const docTypeOptions = [
  { value: "markdown", label: "Markdown" },
  { value: "config", label: "Config" },
  { value: "code", label: "Code" },
  { value: "log", label: "Log" },
];

export function DocumentDialog({ open, onOpenChange, document, onSaved }: DocumentDialogProps) {
  const isEditing = !!document;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [docType, setDocType] = useState("markdown");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (document) {
        setTitle(document.title);
        setContent(document.content ?? "");
        setDocType(document.doc_type);
        setTags(document.tags.join(", "));
      } else {
        setTitle("");
        setContent("");
        setDocType("markdown");
        setTags("");
      }
    }
  }, [open, document]);

  async function logActivity(action: string, desc: string, metadata: Record<string, unknown> = {}) {
    await supabase.from("activities").insert({
      action,
      description: desc,
      metadata,
      agent_id: null,
    });
  }

  function estimateFileSize(text: string): string {
    const bytes = new TextEncoder().encode(text).length;
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);

    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const docData = {
      title: title.trim(),
      content: content || null,
      doc_type: docType,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      word_count: words,
      file_size: estimateFileSize(content),
    };

    if (isEditing) {
      const { error } = await supabase
        .from("documents")
        .update({ ...docData, updated_at: new Date().toISOString() })
        .eq("id", document.id);
      if (!error) {
        await logActivity("updated document", title.trim(), { document_id: document.id });
        onSaved();
        onOpenChange(false);
      }
    } else {
      const { data, error } = await supabase
        .from("documents")
        .insert(docData)
        .select("id")
        .single();
      if (!error && data) {
        await logActivity("created document", title.trim(), { document_id: data.id });
        onSaved();
        onOpenChange(false);
      }
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!document) return;
    setSaving(true);
    const { error } = await supabase.from("documents").delete().eq("id", document.id);
    if (!error) {
      await logActivity("deleted document", document.title, { document_id: document.id });
      onSaved();
      onOpenChange(false);
    }
    setSaving(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#1e1e22] bg-[#111113] text-[#e0e0e0] sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-white">
            {isEditing ? "Edit Document" : "Create Document"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          <div className="grid grid-cols-[1fr_140px] gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-[#999]">Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document title"
                className="border-[#1e1e22] bg-[#0a0a0b] text-sm text-[#e0e0e0] placeholder:text-[#444] focus-visible:ring-1 focus-visible:ring-[#333]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-[#999]">Type</Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger className="border-[#1e1e22] bg-[#0a0a0b] text-sm text-[#e0e0e0] focus:ring-1 focus:ring-[#333]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#1e1e22] bg-[#111113]">
                  {docTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-sm text-[#e0e0e0] focus:bg-[#1e1e22] focus:text-white">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-[#999]">Content</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your document content here..."
              rows={10}
              className="border-[#1e1e22] bg-[#0a0a0b] font-mono text-xs text-[#e0e0e0] placeholder:text-[#444] focus-visible:ring-1 focus-visible:ring-[#333] resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-[#999]">Tags (comma-separated)</Label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. architecture, api, docs"
              className="border-[#1e1e22] bg-[#0a0a0b] text-sm text-[#e0e0e0] placeholder:text-[#444] focus-visible:ring-1 focus-visible:ring-[#333]"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {isEditing ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    disabled={saving}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="text-xs">Delete</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-[#1e1e22] bg-[#111113]">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-sm text-white">Delete document?</AlertDialogTitle>
                    <AlertDialogDescription className="text-xs text-[#999]">
                      This will permanently delete &quot;{document?.title}&quot;. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-[#1e1e22] bg-[#0a0a0b] text-xs text-[#999] hover:bg-[#1e1e22] hover:text-white">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 text-xs text-white hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs text-[#999] hover:bg-[#1e1e22] hover:text-white"
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!title.trim() || saving}
                className="bg-indigo-600 text-xs text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Document"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
