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
import { supabase, type Agent } from "@/lib/supabase";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

type AgentStatus = "working" | "idle" | "paused" | "offline";
type AutonomyLevel = "intern" | "specialist" | "lead" | "chief";

interface AgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent?: Agent | null;
  onSaved: () => void;
}

const statusOptions: { value: AgentStatus; label: string }[] = [
  { value: "working", label: "Working" },
  { value: "idle", label: "Idle" },
  { value: "paused", label: "Paused" },
  { value: "offline", label: "Offline" },
];

const autonomyOptions: { value: AutonomyLevel; label: string }[] = [
  { value: "intern", label: "Intern" },
  { value: "specialist", label: "Specialist" },
  { value: "lead", label: "Lead" },
  { value: "chief", label: "Chief" },
];

const defaultColors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6", "#ec4899", "#14b8a6"];

export function AgentDialog({ open, onOpenChange, agent, onSaved }: AgentDialogProps) {
  const isEditing = !!agent;

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<AgentStatus>("idle");
  const [autonomyLevel, setAutonomyLevel] = useState<AutonomyLevel>("specialist");
  const [color, setColor] = useState(defaultColors[0]);
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (agent) {
        setName(agent.name);
        setRole(agent.role);
        setDescription(agent.description ?? "");
        setStatus(agent.status);
        setAutonomyLevel(agent.autonomy_level);
        setColor(agent.color);
        setTags(agent.tags.join(", "));
      } else {
        setName("");
        setRole("");
        setDescription("");
        setStatus("idle");
        setAutonomyLevel("specialist");
        setColor(defaultColors[Math.floor(Math.random() * defaultColors.length)]);
        setTags("");
      }
    }
  }, [open, agent]);

  async function logActivity(action: string, desc: string, metadata: Record<string, unknown> = {}) {
    await supabase.from("activities").insert({
      action,
      description: desc,
      metadata,
      agent_id: null,
    });
  }

  async function handleSave() {
    if (!name.trim() || !role.trim()) return;
    setSaving(true);

    const agentData = {
      name: name.trim(),
      role: role.trim(),
      description: description.trim() || null,
      status,
      autonomy_level: autonomyLevel,
      color,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    if (isEditing) {
      const { error } = await supabase
        .from("agents")
        .update({ ...agentData, updated_at: new Date().toISOString() })
        .eq("id", agent.id);
      if (!error) {
        await logActivity("updated agent", name.trim(), { agent_id: agent.id });
        toast.success("Agent updated");
        onSaved();
        onOpenChange(false);
      } else {
        toast.error("Failed to update agent");
      }
    } else {
      const { data, error } = await supabase
        .from("agents")
        .insert(agentData)
        .select("id")
        .single();
      if (!error && data) {
        await logActivity("created agent", name.trim(), { agent_id: data.id });
        toast.success("Agent created");
        onSaved();
        onOpenChange(false);
      } else {
        toast.error("Failed to create agent");
      }
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!agent) return;
    setSaving(true);
    const { error } = await supabase.from("agents").delete().eq("id", agent.id);
    if (!error) {
      await logActivity("deleted agent", agent.name, { agent_id: agent.id });
      toast.success("Agent deleted");
      onSaved();
      onOpenChange(false);
    } else {
      toast.error("Failed to delete agent");
    }
    setSaving(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#1e1e22] bg-[#111113] text-[#e0e0e0] sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-white">
            {isEditing ? "Edit Agent" : "Create Agent"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-[#999]">Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Agent name"
                className="border-[#1e1e22] bg-[#0a0a0b] text-sm text-[#e0e0e0] placeholder:text-[#444] focus-visible:ring-1 focus-visible:ring-[#333]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-[#999]">Role *</Label>
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Engineer"
                className="border-[#1e1e22] bg-[#0a0a0b] text-sm text-[#e0e0e0] placeholder:text-[#444] focus-visible:ring-1 focus-visible:ring-[#333]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-[#999]">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this agent do?"
              rows={2}
              className="border-[#1e1e22] bg-[#0a0a0b] text-sm text-[#e0e0e0] placeholder:text-[#444] focus-visible:ring-1 focus-visible:ring-[#333] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-[#999]">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as AgentStatus)}>
                <SelectTrigger className="border-[#1e1e22] bg-[#0a0a0b] text-sm text-[#e0e0e0] focus:ring-1 focus:ring-[#333]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#1e1e22] bg-[#111113]">
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-sm text-[#e0e0e0] focus:bg-[#1e1e22] focus:text-white">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-[#999]">Autonomy Level</Label>
              <Select value={autonomyLevel} onValueChange={(v) => setAutonomyLevel(v as AutonomyLevel)}>
                <SelectTrigger className="border-[#1e1e22] bg-[#0a0a0b] text-sm text-[#e0e0e0] focus:ring-1 focus:ring-[#333]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#1e1e22] bg-[#111113]">
                  {autonomyOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-sm text-[#e0e0e0] focus:bg-[#1e1e22] focus:text-white">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-[#999]">Color</Label>
            <div className="flex gap-2">
              {defaultColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="h-6 w-6 rounded-md border-2 transition-colors"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? "#fff" : "transparent",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-[#999]">Tags (comma-separated)</Label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. frontend, react, testing"
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
                    <AlertDialogTitle className="text-sm text-white">Delete agent?</AlertDialogTitle>
                    <AlertDialogDescription className="text-xs text-[#999]">
                      This will permanently delete &quot;{agent?.name}&quot;. This action cannot be undone.
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
                disabled={!name.trim() || !role.trim() || saving}
                className="bg-indigo-600 text-xs text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Agent"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
