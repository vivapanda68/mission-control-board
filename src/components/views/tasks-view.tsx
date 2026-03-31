"use client";

import { useState, useEffect, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase, type Task } from "@/lib/supabase";
import { formatTokenCount } from "@/lib/format";
import { MoreHorizontal, Plus } from "lucide-react";
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

type TaskStatus = "backlog" | "in_progress" | "review" | "done";

const columns: { status: TaskStatus; label: string; dotColor: string }[] = [
  { status: "backlog", label: "To Do", dotColor: "#888" },
  { status: "in_progress", label: "In Progress", dotColor: "#10b981" },
  { status: "review", label: "Review", dotColor: "#f59e0b" },
  { status: "done", label: "Done", dotColor: "#06b6d4" },
];

const allStatuses: { value: TaskStatus; label: string }[] = [
  { value: "backlog", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

const priorityColors: Record<string, string> = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#ef4444",
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
      className="group cursor-pointer rounded-lg border border-[#252529] bg-[#131316] p-3.5 transition-colors hover:border-[#3a3a3e] active:bg-[#1a1a1e] md:p-3"
      onClick={() => onEdit(task)}
    >
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 rounded-full md:h-2 md:w-2"
            style={{ backgroundColor: priorityColors[task.priority] ?? "#777" }}
          />
          {task.projects?.name && (
            <Badge
              variant="outline"
              className="border-transparent bg-[#252529] px-1.5 py-0 text-[11px] text-[#a0a0a0]"
            >
              {task.projects.name}
            </Badge>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="h-7 w-7 text-[#777] hover:text-white md:h-6 md:w-6 md:opacity-0 md:group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4 md:h-3 md:w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="border-[#252529] bg-[#131316]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-2 py-1.5">
              <span className="text-[11px] font-medium text-[#777]">Move to</span>
            </div>
            {allStatuses
              .filter((s) => s.value !== task.status)
              .map((s) => (
                <DropdownMenuItem
                  key={s.value}
                  className="text-xs text-[#b0b0b0] focus:bg-[#252529] focus:text-white"
                  onClick={() => onStatusChange(task, s.value)}
                >
                  {s.label}
                </DropdownMenuItem>
              ))}
            <DropdownMenuSeparator className="bg-[#252529]" />
            <DropdownMenuItem
              className="text-xs text-[#b0b0b0] focus:bg-[#252529] focus:text-white"
              onClick={() => onEdit(task)}
            >
              Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <h4 className="mb-1 text-sm font-medium text-[#f0f0f0]">
        {task.title}
      </h4>
      {task.description && (
        <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-[#777]">
          {task.description}
        </p>
      )}
      <div className="flex items-center justify-between gap-1.5">
        {task.input_tokens != null && task.output_tokens != null ? (
          <span className="text-[10px] text-[#666]">
            {formatTokenCount(task.input_tokens)} in / {formatTokenCount(task.output_tokens)} out{task.model_used ? ` \u00b7 ${task.model_used}` : ""}
          </span>
        ) : (
          <span />
        )}
        {task.agents?.name && (
          <div
            className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white md:h-5 md:w-5"
            style={{ backgroundColor: task.agents?.color ?? "#777" }}
          >
            {task.agents.name[0]}
          </div>
        )}
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
  onCreateInColumn,
}: {
  status: TaskStatus;
  label: string;
  dotColor: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  onCreateInColumn: () => void;
}) {
  // For "done" column, only show last 2 weeks
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const columnTasks = tasks
    .filter((t) => {
      if (t.status !== status) return false;
      if (status === "done" && new Date(t.updated_at) < twoWeeksAgo) return false;
      return true;
    })
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return (order[a.priority] ?? 1) - (order[b.priority] ?? 1);
    });

  // Group tasks by project
  const grouped: Record<string, Task[]> = {};
  const noProject: Task[] = [];
  for (const task of columnTasks) {
    const projectName = task.projects?.name;
    if (projectName) {
      if (!grouped[projectName]) grouped[projectName] = [];
      grouped[projectName].push(task);
    } else {
      noProject.push(task);
    }
  }
  // Sort project groups by first task priority
  const sortedGroups = Object.entries(grouped).sort(([, a], [, b]) => {
    const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return (order[a[0]?.priority] ?? 1) - (order[b[0]?.priority] ?? 1);
  });

  return (
    <div className="flex flex-col md:min-w-[260px] md:flex-1">
      {/* Column header — acts as section header on mobile */}
      <div className="mb-2.5 flex items-center gap-2 px-1 md:mb-3">
        <div
          className="h-2.5 w-2.5 rounded-full md:h-2 md:w-2"
          style={{ backgroundColor: dotColor }}
        />
        <span className="text-sm font-semibold text-[#b0b0b0] md:text-xs md:font-medium">{label}</span>
        <span className="text-sm text-[#666] md:text-xs">{columnTasks.length}</span>
        <Button
          variant="ghost"
          size="icon-xs"
          className="ml-auto h-7 w-7 text-[#777] hover:text-white md:h-6 md:w-6"
          onClick={onCreateInColumn}
        >
          <Plus className="h-4 w-4 md:h-3 md:w-3" />
        </Button>
      </div>
      <div className="flex flex-col gap-2.5 md:gap-3">
        {sortedGroups.map(([projectName, projectTasks]) => (
          <div key={projectName}>
            <div className="mb-1.5 flex items-center gap-1.5 px-1">
              <div
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "#6366f1" }}
              />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#777]">
                {projectName}
              </span>
              <span className="text-[11px] text-[#666]">{projectTasks.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {projectTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEdit}
                  onStatusChange={onStatusChange}
                />
              ))}
            </div>
          </div>
        ))}
        {noProject.length > 0 && (
          <div>
            <div className="mb-1.5 flex items-center gap-1.5 px-1">
              <div className="h-1.5 w-1.5 rounded-full bg-[#555]" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#777]">
                Unassigned
              </span>
              <span className="text-[11px] text-[#666]">{noProject.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {noProject.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEdit}
                  onStatusChange={onStatusChange}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function TasksView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchData = useCallback(async () => {
    const { data } = await supabase
      .from("tasks")
      .select("*, agents(*), projects(*)")
      .order("created_at", { ascending: false });
    if (data) setTasks(data);
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

  async function handleStatusChange(
    task: Task,
    newStatus: TaskStatus,
    tokenData?: { input_tokens?: number; output_tokens?: number; cached_tokens?: number; model_used?: string },
  ) {
    const { error } = await supabase
      .from("tasks")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
        ...(tokenData?.input_tokens != null && { input_tokens: tokenData.input_tokens }),
        ...(tokenData?.output_tokens != null && { output_tokens: tokenData.output_tokens }),
        ...(tokenData?.cached_tokens != null && { cached_tokens: tokenData.cached_tokens }),
        ...(tokenData?.model_used != null && { model_used: tokenData.model_used }),
      })
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
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-6 border-b border-[#252529] px-4 py-3 md:px-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 w-24 animate-pulse rounded bg-[#252529]" />
          ))}
        </div>
        <div className="flex flex-col gap-4 p-4 md:flex-row md:p-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2 md:min-w-[260px] md:flex-1">
              <div className="mb-2 h-3 w-20 animate-pulse rounded bg-[#252529]" />
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-24 animate-pulse rounded-lg border border-[#252529] bg-[#131316]" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#252529] px-4 py-3 md:px-6">
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#888] md:text-xs">
            {tasks.length} tasks total
          </span>
        </div>
        <Button
          size="sm"
          onClick={handleCreateClick}
          className="h-9 gap-1.5 bg-indigo-600 px-4 text-sm text-white hover:bg-indigo-700 md:h-8 md:px-3 md:text-xs"
        >
          <Plus className="h-4 w-4 md:h-3.5 md:w-3.5" />
          New Task
        </Button>
      </div>

      {/* Kanban board — stacked vertically on mobile, horizontal on desktop */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-6 p-4 md:flex-row md:gap-4 md:p-6">
          {columns.map((col) => (
            <KanbanColumn
              key={col.status}
              status={col.status}
              label={col.label}
              dotColor={col.dotColor}
              tasks={tasks}
              onEdit={handleEditClick}
              onStatusChange={handleStatusChange}
              onCreateInColumn={handleCreateClick}
            />
          ))}
        </div>
      </ScrollArea>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        onSaved={fetchData}
      />
    </div>
  );
}
