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
import { supabase, type Project, type Agent } from "@/lib/supabase";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

type ProjectStatus = "active" | "planning" | "paused" | "completed";
type ProjectPriority = "high" | "medium" | "low";

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  onSaved: () => void;
}

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: "planning", label: "Planning" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
];

const priorityOptions: { value: ProjectPriority; label: string }[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export function ProjectDialog({ open, onOpenChange, project, onSaved }: ProjectDialogProps) {
  const isEditing = !!project;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("planning");
  const [priority, setPriority] = useState<ProjectPriority>("medium");
  const [ownerId, setOwnerId] = useState("");
  const [saving, setSaving] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    if (!open) return;
    async function fetchAgents() {
      const { data } = await supabase.from("agents").select("*").order("name");
      if (data) setAgents(data);
    }
    fetchAgents();
  }, [open]);

  useEffect(() => {
    if (open) {
      if (project) {
        setName(project.name);
        setDescription(project.description ?? "");
        setStatus(project.status);
        setPriority(project.priority);
        setOwnerId(project.owner_id ?? "");
      } else {
        setName("");
        setDescription("");
        setStatus("planning");
        setPriority("medium");
        setOwnerId("");
      }
    }
  }, [open, project]);

  async function logActivity(action: string, desc: string, metadata: Record<string, unknown> = {}) {
    await supabase.from("activities").insert({
      action,
      description: desc,
      metadata,
      agent_id: null,
    });
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);

    const projectData = {
      name: name.trim(),
      description: description.trim() || null,
      status,
      priority,
      owner_id: ownerId && ownerId !== "none" ? ownerId : null,
    };

    if (isEditing) {
      const { error } = await supabase
        .from("projects")
        .update({ ...projectData, updated_at: new Date().toISOString() })
        .eq("id", project.id);
      if (!error) {
        await logActivity("updated project", name.trim(), { project_id: project.id, status });
        toast.success("Project updated");
        onSaved();
        onOpenChange(false);
      } else {
        toast.error("Failed to update project");
      }
    } else {
      const { data, error } = await supabase
        .from("projects")
        .insert({ ...projectData, progress_percent: 0, total_tasks: 0, completed_tasks: 0 })
        .select("id")
        .single();
      if (!error && data) {
        await logActivity("created project", name.trim(), { project_id: data.id, status });
        toast.success("Project created");
        onSaved();
        onOpenChange(false);
      } else {
        toast.error("Failed to create project");
      }
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!project) return;
    setSaving(true);
    const { error } = await supabase.from("projects").delete().eq("id", project.id);
    if (!error) {
      await logActivity("deleted project", project.name, { project_id: project.id });
      toast.success("Project deleted");
      onSaved();
      onOpenChange(false);
    } else {
      toast.error("Failed to delete project");
    }
    setSaving(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#252529] bg-[#131316] text-[#f0f0f0] sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-white">
            {isEditing ? "Edit Project" : "Create Project"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-[#b0b0b0]">Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
              className="border-[#252529] bg-[#0a0a0b] text-sm text-[#f0f0f0] placeholder:text-[#666] focus-visible:ring-1 focus-visible:ring-[#444]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-[#b0b0b0]">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Project description"
              rows={3}
              className="border-[#252529] bg-[#0a0a0b] text-sm text-[#f0f0f0] placeholder:text-[#666] focus-visible:ring-1 focus-visible:ring-[#444] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-[#b0b0b0]">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
                <SelectTrigger className="border-[#252529] bg-[#0a0a0b] text-sm text-[#f0f0f0] focus:ring-1 focus:ring-[#444]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#252529] bg-[#131316]">
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-sm text-[#f0f0f0] focus:bg-[#252529] focus:text-white">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-[#b0b0b0]">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as ProjectPriority)}>
                <SelectTrigger className="border-[#252529] bg-[#0a0a0b] text-sm text-[#f0f0f0] focus:ring-1 focus:ring-[#444]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#252529] bg-[#131316]">
                  {priorityOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-sm text-[#f0f0f0] focus:bg-[#252529] focus:text-white">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-[#b0b0b0]">Owner</Label>
            <Select value={ownerId} onValueChange={setOwnerId}>
              <SelectTrigger className="border-[#252529] bg-[#0a0a0b] text-sm text-[#f0f0f0] focus:ring-1 focus:ring-[#444]">
                <SelectValue placeholder="No owner" />
              </SelectTrigger>
              <SelectContent className="border-[#252529] bg-[#131316]">
                <SelectItem value="none" className="text-sm text-[#777] focus:bg-[#252529] focus:text-white">
                  No owner
                </SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id} className="text-sm text-[#f0f0f0] focus:bg-[#252529] focus:text-white">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: agent.color }} />
                      {agent.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                <AlertDialogContent className="border-[#252529] bg-[#131316]">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-sm text-white">Delete project?</AlertDialogTitle>
                    <AlertDialogDescription className="text-xs text-[#b0b0b0]">
                      This will permanently delete &quot;{project?.name}&quot;. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-[#252529] bg-[#0a0a0b] text-xs text-[#b0b0b0] hover:bg-[#252529] hover:text-white">
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
                className="text-xs text-[#b0b0b0] hover:bg-[#252529] hover:text-white"
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!name.trim() || saving}
                className="bg-indigo-600 text-xs text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Project"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
