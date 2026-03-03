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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase, type Schedule, type Agent } from "@/lib/supabase";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule?: Schedule | null;
  onSaved: () => void;
}

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const defaultColors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6"];

export function ScheduleDialog({ open, onOpenChange, schedule, onSaved }: ScheduleDialogProps) {
  const isEditing = !!schedule;

  const [taskName, setTaskName] = useState("");
  const [agentId, setAgentId] = useState("");
  const [timeSlot, setTimeSlot] = useState("09:00");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([0, 1, 2, 3, 4]);
  const [isAlwaysRunning, setIsAlwaysRunning] = useState(false);
  const [frequency, setFrequency] = useState("");
  const [color, setColor] = useState(defaultColors[0]);
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
      if (schedule) {
        setTaskName(schedule.task_name);
        setAgentId(schedule.agent_id ?? "");
        setTimeSlot(schedule.time_slot);
        setDurationMinutes(schedule.duration_minutes);
        setDaysOfWeek(schedule.days_of_week);
        setIsAlwaysRunning(schedule.is_always_running);
        setFrequency(schedule.frequency ?? "");
        setColor(schedule.color);
      } else {
        setTaskName("");
        setAgentId("");
        setTimeSlot("09:00");
        setDurationMinutes(60);
        setDaysOfWeek([0, 1, 2, 3, 4]);
        setIsAlwaysRunning(false);
        setFrequency("");
        setColor(defaultColors[Math.floor(Math.random() * defaultColors.length)]);
      }
    }
  }, [open, schedule]);

  async function logActivity(action: string, desc: string, metadata: Record<string, unknown> = {}) {
    await supabase.from("activities").insert({
      action,
      description: desc,
      metadata,
      agent_id: null,
    });
  }

  function toggleDay(day: number) {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }

  async function handleSave() {
    if (!taskName.trim()) return;
    setSaving(true);

    const scheduleData = {
      task_name: taskName.trim(),
      agent_id: agentId && agentId !== "none" ? agentId : null,
      time_slot: timeSlot,
      duration_minutes: durationMinutes,
      days_of_week: daysOfWeek,
      is_always_running: isAlwaysRunning,
      frequency: frequency.trim() || null,
      color,
    };

    if (isEditing) {
      const { error } = await supabase
        .from("schedules")
        .update(scheduleData)
        .eq("id", schedule.id);
      if (!error) {
        await logActivity("updated schedule", taskName.trim(), { schedule_id: schedule.id });
        toast.success("Schedule updated");
        onSaved();
        onOpenChange(false);
      } else {
        toast.error("Failed to update schedule");
      }
    } else {
      const { data, error } = await supabase
        .from("schedules")
        .insert(scheduleData)
        .select("id")
        .single();
      if (!error && data) {
        await logActivity("created schedule", taskName.trim(), { schedule_id: data.id });
        toast.success("Schedule created");
        onSaved();
        onOpenChange(false);
      } else {
        toast.error("Failed to create schedule");
      }
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!schedule) return;
    setSaving(true);
    const { error } = await supabase.from("schedules").delete().eq("id", schedule.id);
    if (!error) {
      await logActivity("deleted schedule", schedule.task_name, { schedule_id: schedule.id });
      toast.success("Schedule deleted");
      onSaved();
      onOpenChange(false);
    } else {
      toast.error("Failed to delete schedule");
    }
    setSaving(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#1e1e22] bg-[#111113] text-[#e0e0e0] sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-white">
            {isEditing ? "Edit Schedule" : "Create Schedule"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-[#999]">Task Name *</Label>
            <Input
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g. Daily standup"
              className="border-[#1e1e22] bg-[#0a0a0b] text-sm text-[#e0e0e0] placeholder:text-[#444] focus-visible:ring-1 focus-visible:ring-[#333]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-[#999]">Agent</Label>
            <Select value={agentId} onValueChange={setAgentId}>
              <SelectTrigger className="border-[#1e1e22] bg-[#0a0a0b] text-sm text-[#e0e0e0] focus:ring-1 focus:ring-[#333]">
                <SelectValue placeholder="No agent" />
              </SelectTrigger>
              <SelectContent className="border-[#1e1e22] bg-[#111113]">
                <SelectItem value="none" className="text-sm text-[#666] focus:bg-[#1e1e22] focus:text-white">
                  No agent
                </SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id} className="text-sm text-[#e0e0e0] focus:bg-[#1e1e22] focus:text-white">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: agent.color }} />
                      {agent.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAlwaysRunning}
                onChange={(e) => setIsAlwaysRunning(e.target.checked)}
                className="rounded border-[#1e1e22]"
              />
              <span className="text-xs text-[#999]">Always Running</span>
            </label>
          </div>

          {!isAlwaysRunning && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-[#999]">Time</Label>
                  <Input
                    type="time"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="border-[#1e1e22] bg-[#0a0a0b] text-sm text-[#e0e0e0] focus-visible:ring-1 focus-visible:ring-[#333]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-[#999]">Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 60)}
                    min={15}
                    max={480}
                    className="border-[#1e1e22] bg-[#0a0a0b] text-sm text-[#e0e0e0] focus-visible:ring-1 focus-visible:ring-[#333]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-[#999]">Days of Week</Label>
                <div className="flex gap-1.5">
                  {dayLabels.map((label, i) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toggleDay(i)}
                      className="flex h-8 w-9 items-center justify-center rounded-md border text-[10px] font-medium transition-colors"
                      style={{
                        backgroundColor: daysOfWeek.includes(i) ? "#6366f1" : "transparent",
                        borderColor: daysOfWeek.includes(i) ? "#6366f1" : "#1e1e22",
                        color: daysOfWeek.includes(i) ? "#fff" : "#666",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-[#999]">Frequency</Label>
            <Input
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              placeholder="e.g. daily, weekly"
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
                    <AlertDialogTitle className="text-sm text-white">Delete schedule?</AlertDialogTitle>
                    <AlertDialogDescription className="text-xs text-[#999]">
                      This will permanently delete &quot;{schedule?.task_name}&quot;. This action cannot be undone.
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
                disabled={!taskName.trim() || saving}
                className="bg-indigo-600 text-xs text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Schedule"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
