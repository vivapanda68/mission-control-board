"use client";

import { useState, useEffect, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase, type Task, type Activity } from "@/lib/supabase";
import { formatRelativeTime } from "@/lib/format";
import { Clock, MoreHorizontal, Plus, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskDialog } from "@/components/task-dialog";

type TaskStatus = "recurring" | "backlog" | "in_progress" | "review" | "done";

const columns: { status: TaskStatus; label: string; dotColor: string }[] = [
  { status: "recurring", label: "Recurring", dotColor: "#6366f1" },
  { status: "backlog", label: "Backlog", dotColor: "#666" },
  { status: "in_progress", label: "In Progress", dotColor: "#10b981" },
  { status: "review", label: "Review", dotColor: "#f59e0b" },
];

const allStatuses: { value: TaskStatus; label: string }[] = [
  { value: "recurring", label: "Recurring" },
  { value: "backlog", label: "Backlog" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

const priorityColors: Record<string, string> = {
  low: "#555",
  medium: "#6366f1",
  high: "#f59e0b",
};


function TaskCard({
  task,
  onEdit,
  onStatusChange,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}) {
  return (
    <div
      className="group cursor-pointer rounded-lg border border-[#1e1e22] bg-[#111113] p-3 transition-colors hover:border-[#2a2a2e]"
      onClick={() => onEdit(task)}
    >
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: task.agents?.color ?? task.color }}
          />
          <span className="text-xs text-[#666]">{task.id.slice(0, 8)}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="opacity-0 group-hover:opacity-100 text-[#555] hover:text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="border-[#1e1e22] bg-[#111113]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-2 py-1.5">
              <span className="text-[10px] font-medium text-[#555]">Move to</span>
            </div>
            {allStatuses
              .filter((s) => s.value !== task.status)
              .map((s) => (
                <DropdownMenuItem
                  key={s.value}
                  className="text-xs text-[#999] focus:bg-[#1e1e22] focus:text-white"
                  onClick={() => onStatusChange(task, s.value)}
                >
                  {s.label}
                </DropdownMenuItem>
              ))}
            <DropdownMenuSeparator className="bg-[#1e1e22]" />
            <DropdownMenuItem
              className="text-xs text-[#999] focus:bg-[#1e1e22] focus:text-white"
              onClick={() => onEdit(task)}
            >
              Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <h4 className="mb-1 text-[13px] font-medium text-[#e0e0e0]">
        {task.title}
      </h4>
      <p className="mb-3 text-xs leading-relaxed text-[#666]">
        {task.description}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex gap-1" />
        <div className="flex items-center gap-1.5">
          {task.agents?.name && (
            <div
              className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white"
              style={{ backgroundColor: task.agents?.color ?? task.color }}
            >
              {task.agents.name[0]}
            </div>
          )}
          <div
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: priorityColors[task.priority] }}
          />
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({
  status,
  label,
  dotColor,
  tasks,
  onEdit,
  onStatusChange,
}: {
  status: TaskStatus;
  label: string;
  dotColor: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}) {
  const columnTasks = tasks.filter((t) => t.status === status);
  return (
    <div className="flex min-w-[260px] flex-1 flex-col">
      <div className="mb-3 flex items-center gap-2 px-1">
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: dotColor }}
        />
        <span className="text-xs font-medium text-[#999]">{label}</span>
        <span className="text-xs text-[#444]">{columnTasks.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {columnTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </div>
  );
}

function LiveActivitySidebar({ activities }: { activities: Activity[] }) {
  return (
    <div className="flex w-[280px] flex-col border-l border-[#1e1e22]">
      <div className="flex items-center gap-2 border-b border-[#1e1e22] px-4 py-3">
        <Zap className="h-3.5 w-3.5 text-emerald-500" />
        <span className="text-xs font-medium text-[#999]">Live Activity</span>
        <div className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-0.5 p-2">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="group flex gap-2 rounded-md px-2 py-2 transition-colors hover:bg-[#111113]"
            >
              <div
                className="mt-0.5 h-5 w-5 flex-shrink-0 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                style={{ backgroundColor: activity.agents?.color ?? "#666" }}
              >
                {(activity.agents?.name ?? "?")[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs leading-relaxed text-[#888]">
                  <span
                    className="font-medium"
                    style={{ color: activity.agents?.color ?? "#666" }}
                  >
                    {activity.agents?.name ?? "Unknown"}
                  </span>{" "}
                  {activity.action}{" "}
                  <span className="text-[#ccc]">{activity.description}</span>
                </p>
                <span className="text-[10px] text-[#444]">
                  {formatRelativeTime(activity.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export function TasksView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchData = useCallback(async () => {
    const [tasksRes, activitiesRes] = await Promise.all([
      supabase
        .from("tasks")
        .select("*, agents(*), projects(*)")
        .order("created_at", { ascending: false }),
      supabase
        .from("activities")
        .select("*, agents(*)")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);
    if (tasksRes.data) setTasks(tasksRes.data);
    if (activitiesRes.data) setActivities(activitiesRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleCreateClick() {
    setEditingTask(null);
    setDialogOpen(true);
  }

  function handleEditClick(task: Task) {
    setEditingTask(task);
    setDialogOpen(true);
  }

  async function handleStatusChange(task: Task, newStatus: TaskStatus) {
    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", task.id);
    if (!error) {
      await supabase.from("activities").insert({
        action: "moved task",
        description: `${task.title} to ${newStatus.replace("_", " ")}`,
        metadata: { task_id: task.id, from: task.status, to: newStatus },
        agent_id: null,
      });
      toast.success(`Task moved to ${newStatus.replace("_", " ")}`);
      fetchData();
    } else {
      toast.error("Failed to move task");
    }
  }

  if (loading) {
    return (
      <div className="flex h-full">
        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-6 border-b border-[#1e1e22] px-6 py-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 w-24 animate-pulse rounded bg-[#1e1e22]" />
            ))}
          </div>
          <div className="flex gap-4 p-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex min-w-[260px] flex-1 flex-col gap-2">
                <div className="mb-2 h-3 w-20 animate-pulse rounded bg-[#1e1e22]" />
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-24 animate-pulse rounded-lg border border-[#1e1e22] bg-[#111113]" />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="w-[280px] border-l border-[#1e1e22]" />
      </div>
    );
  }

  const totalTasks = tasks.length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const inReview = tasks.filter((t) => t.status === "review").length;
  const activeAgents = new Set(
    tasks.filter((t) => t.agents?.name).map((t) => t.agents?.name)
  ).size;

  const stats = [
    { label: "Total Tasks", value: totalTasks },
    { label: "In Progress", value: inProgress, color: "#10b981" },
    { label: "In Review", value: inReview, color: "#f59e0b" },
    { label: "Active Agents", value: activeAgents, color: "#6366f1" },
  ];

  return (
    <div className="flex h-full">
      <div className="flex flex-1 flex-col">
        {/* Stats header */}
        <div className="flex items-center gap-6 border-b border-[#1e1e22] px-6 py-3">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-2">
              {stat.color && (
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: stat.color }}
                />
              )}
              <span className="text-xs text-[#555]">{stat.label}</span>
              <span className="text-sm font-semibold text-white">
                {stat.value}
              </span>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleCreateClick}
              className="gap-1.5 bg-indigo-600 text-xs text-white hover:bg-indigo-700"
            >
              <Plus className="h-3.5 w-3.5" />
              New Task
            </Button>
            <div className="mx-1 h-4 w-px bg-[#1e1e22]" />
            <Clock className="h-3 w-3 text-[#555]" />
            <span className="text-[10px] text-[#555]">
              Updated {formatRelativeTime(new Date().toISOString())}
            </span>
          </div>
        </div>

        {/* Kanban board */}
        <ScrollArea className="flex-1">
          <div className="flex gap-4 p-6">
            {columns.map((col) => (
              <KanbanColumn
                key={col.status}
                status={col.status}
                label={col.label}
                dotColor={col.dotColor}
                tasks={tasks}
                onEdit={handleEditClick}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Live Activity sidebar */}
      <LiveActivitySidebar activities={activities} />

      {/* Task create/edit dialog */}
      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        onSaved={fetchData}
      />
    </div>
  );
}
