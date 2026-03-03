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
import { supabase, type Task, type Agent, type Project } from "@/lib/supabase";
import { Trash2 } from "lucide-react";

type TaskStatus = "recurring" | "backlog" | "in_progress" | "review" | "done";
type TaskPriority = "high" | "medium" | "low";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  onSaved: () => void;
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: "recurring", label: "Recurring" },
  { value: "backlog", label: "Backlog" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const defaultColors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6"];

export function TaskDialog({ open, onOpenChange, task, onSaved }: TaskDialogProps) {
  const isEditing = !!task;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("backlog");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const [agents, setAgents] = useState<Agent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Fetch agents and projects for dropdowns
  useEffect(() => {
    if (!open) return;
    async function fetchOptions() {
      const [agentsRes, projectsRes] = await Promise.all([
        supabase.from("agents").select("*").order("name"),
        supabase.from("projects").select("*").order("name"),
      ]);
      if (agentsRes.data) setAgents(agentsRes.data);
      if (projectsRes.data) setProjects(projectsRes.data);
    }
    fetchOptions();
  }, [open]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description ?? "");
        setStatus(task.status);
        setPriority(task.priority);
        setAssigneeId(task.assignee_id ?? "");
        setProjectId(task.project_id ?? "");
      } else {
        setTitle("");
        setDescription("");
        setStatus("backlog");
        setPriority("medium");
        setAssigneeId("");
        setProjectId("");
      }
    }
  }, [open, task]);

  async function logActivity(action: string, desc: string, metadata: Record<string, unknown> = {}) {
    await supabase.from("activities").insert({
      action,
      description: desc,
      metadata,
      agent_id: null,
    });
  }

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);

    const taskData = {
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority,
      assignee_id: assigneeId && assigneeId !== "none" ? assigneeId : null,
      project_id: projectId && projectId !== "none" ? projectId : null,
      color: defaultColors[Math.floor(Math.random() * defaultColors.length)],
    };

    if (isEditing) {
      const { error } = await supabase
        .from("tasks")
        .update({ ...taskData, updated_at: new Date().toISOString() })
        .eq("id", task.id);
      if (!error) {
        await logActivity("updated task", title.trim(), { task_id: task.id, status });
        onSaved();
        onOpenChange(false);
      }
    } else {
      const { data, error } = await supabase
        .from("tasks")
        .insert(taskData)
        .select("id")
        .single();
      if (!error && data) {
        await logActivity("created task", title.trim(), { task_id: data.id, status });
        onSaved();
        onOpenChange(false);
      }
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!task) return;
    setSaving(true);
    const { error } = await supabase.from("tasks").delete().eq("id", task.id);
    if (!error) {
      await logActivity("deleted task", task.title, { task_id: task.id });
      onSaved();
      onOpenChange(false);
    }
    setSaving(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#1e1e22] bg-[#111113] text-[#e0e0e0] sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-white">
            {isEditing ? "Edit Task" : "Create Task"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-[#999]">Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="border-[#1e1e22] bg-[#0a0a0b] text-sm text-[#e0e0e0] placeholder:text-[#444] focus-visible:ring-1 focus-visible:ring-[#333]"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-[#999]">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
              rows={3}
              className="border-[#1e1e22] bg-[#0a0a0b] text-sm text-[#e0e0e0] placeholder:text-[#444] focus-visible:ring-1 focus-visible:ring-[#333] resize-none"
            />
          </div>

          {/* Status & Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-[#999]">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
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
              <Label className="text-xs text-[#999]">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger className="border-[#1e1e22] bg-[#0a0a0b] text-sm text-[#e0e0e0] focus:ring-1 focus:ring-[#333]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#1e1e22] bg-[#111113]">
                  {priorityOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-sm text-[#e0e0e0] focus:bg-[#1e1e22] focus:text-white">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignee & Project row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-[#999]">Assignee</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger className="border-[#1e1e22] bg-[#0a0a0b] text-sm text-[#e0e0e0] focus:ring-1 focus:ring-[#333]">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent className="border-[#1e1e22] bg-[#111113]">
                  <SelectItem value="none" className="text-sm text-[#666] focus:bg-[#1e1e22] focus:text-white">
                    Unassigned
                  </SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id} className="text-sm text-[#e0e0e0] focus:bg-[#1e1e22] focus:text-white">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: agent.color }}
                        />
                        {agent.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-[#999]">Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="border-[#1e1e22] bg-[#0a0a0b] text-sm text-[#e0e0e0] focus:ring-1 focus:ring-[#333]">
                  <SelectValue placeholder="No project" />
                </SelectTrigger>
                <SelectContent className="border-[#1e1e22] bg-[#111113]">
                  <SelectItem value="none" className="text-sm text-[#666] focus:bg-[#1e1e22] focus:text-white">
                    No project
                  </SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id} className="text-sm text-[#e0e0e0] focus:bg-[#1e1e22] focus:text-white">
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
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
                    <AlertDialogTitle className="text-sm text-white">Delete task?</AlertDialogTitle>
                    <AlertDialogDescription className="text-xs text-[#999]">
                      This will permanently delete &quot;{task?.title}&quot;. This action cannot be undone.
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
                {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Task"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
