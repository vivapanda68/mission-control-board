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
import { supabase, type MemoryEntry } from "@/lib/supabase";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

type EntryType = "journal" | "long_term" | "decision" | "insight";

interface MemoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: MemoryEntry | null;
  onSaved: () => void;
}

const entryTypeOptions: { value: EntryType; label: string }[] = [
  { value: "journal", label: "Journal" },
  { value: "decision", label: "Decision" },
  { value: "insight", label: "Insight" },
  { value: "long_term", label: "Long-Term" },
];

export function MemoryDialog({ open, onOpenChange, entry, onSaved }: MemoryDialogProps) {
  const isEditing = !!entry;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [entryType, setEntryType] = useState<EntryType>("journal");
  const [entryDate, setEntryDate] = useState("2026-03-02");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (entry) {
        setTitle(entry.title);
        setContent(entry.content ?? "");
        setEntryType(entry.entry_type);
        setEntryDate(entry.entry_date);
        setTags(entry.tags.join(", "));
      } else {
        setTitle("");
        setContent("");
        setEntryType("journal");
        setEntryDate(new Date().toISOString().split("T")[0]);
        setTags("");
      }
    }
  }, [open, entry]);

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
    const memoryData = {
      title: title.trim(),
      content: content.trim() || null,
      entry_type: entryType,
      entry_date: entryDate,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      word_count: words,
      file_size: estimateFileSize(content),
    };

    if (isEditing) {
      const { error } = await supabase
        .from("memory_entries")
        .update({ ...memoryData, updated_at: new Date().toISOString() })
        .eq("id", entry.id);
      if (!error) {
        await logActivity("updated memory", title.trim(), { entry_id: entry.id });
        toast.success("Memory entry updated");
        onSaved();
        onOpenChange(false);
      } else {
        toast.error("Failed to update memory entry");
      }
    } else {
      const { data, error } = await supabase
        .from("memory_entries")
        .insert(memoryData)
        .select("id")
        .single();
      if (!error && data) {
        await logActivity("created memory", title.trim(), { entry_id: data.id });
        toast.success("Memory entry created");
        onSaved();
        onOpenChange(false);
      } else {
        toast.error("Failed to create memory entry");
      }
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!entry) return;
    setSaving(true);
    const { error } = await supabase.from("memory_entries").delete().eq("id", entry.id);
    if (!error) {
      await logActivity("deleted memory", entry.title, { entry_id: entry.id });
      toast.success("Memory entry deleted");
      onSaved();
      onOpenChange(false);
    } else {
      toast.error("Failed to delete memory entry");
    }
    setSaving(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#1e1e22] bg-[#111113] text-[#e0e0e0] sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-white">
            {isEditing ? "Edit Memory Entry" : "New Memory Entry"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-[#999]">Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Entry title"
              className="border-[#1e1e22] bg-[#0a0a0b] text-sm text-[#e0e0e0] placeholder:text-[#444] focus-visible:ring-1 focus-visible:ring-[#333]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-[#999]">Content</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your entry..."
              rows={6}
              className="border-[#1e1e22] bg-[#0a0a0b] text-sm text-[#e0e0e0] placeholder:text-[#444] focus-visible:ring-1 focus-visible:ring-[#333] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-[#999]">Type</Label>
              <Select value={entryType} onValueChange={(v) => setEntryType(v as EntryType)}>
                <SelectTrigger className="border-[#1e1e22] bg-[#0a0a0b] text-sm text-[#e0e0e0] focus:ring-1 focus:ring-[#333]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#1e1e22] bg-[#111113]">
                  {entryTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-sm text-[#e0e0e0] focus:bg-[#1e1e22] focus:text-white">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-[#999]">Date</Label>
              <Input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="border-[#1e1e22] bg-[#0a0a0b] text-sm text-[#e0e0e0] focus-visible:ring-1 focus-visible:ring-[#333]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-[#999]">Tags (comma-separated)</Label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. architecture, decision, learning"
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
                    <AlertDialogTitle className="text-sm text-white">Delete entry?</AlertDialogTitle>
                    <AlertDialogDescription className="text-xs text-[#999]">
                      This will permanently delete &quot;{entry?.title}&quot;. This action cannot be undone.
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
                {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Entry"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
