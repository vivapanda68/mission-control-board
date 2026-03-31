"use client";

import { useState, useEffect, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase, type Task } from "@/lib/supabase";
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
  { status: "backlog", label: "To Do", dotColor: "#666" },
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
      className="group cursor-pointer rounded-lg border border-[#1e1e22] bg-[#111113] p-3 transition-colors hover:border-[#2a2a2e]"
      onClick={() => onEdit(task)}
    >
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: priorityColors[task.priority] ?? "#666" }}
          />
          {task.projects?.name && (
            <Badge
              variant="outline"
              className="border-transparent bg-[#1e1e22] px-1.5 py-0 text-[9px] text-[#888]"
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
      {task.description && (
        <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-[#666]">
          {task.description}
        </p>
      )}
      <div className="flex items-center justify-end gap-1.5">
        {task.agents?.name && (
          <div
            className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold text-white"
            style={{ backgroundColor: task.agents?.color ?? "#666" }}
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
    <div className="flex min-w-[260px] flex-1 flex-col">
      <div className="mb-3 flex items-center gap-2 px-1">
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: dotColor }}
        />
        <span className="text-xs font-medium text-[#999]">{label}</span>
        <span className="text-xs text-[#444]">{columnTasks.length}</span>
        <Button
          variant="ghost"
          size="icon-xs"
          className="ml-auto text-[#555] hover:text-white"
          onClick={onCreateInColumn}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        {sortedGroups.map(([projectName, projectTasks]) => (
          <div key={projectName}>
            <div className="mb-1.5 flex items-center gap-1.5 px-1">
              <div
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "#6366f1" }}
              />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#555]">
                {projectName}
              </span>
              <span className="text-[10px] text-[#333]">{projectTasks.length}</span>
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
              <div className="h-1.5 w-1.5 rounded-full bg-[#333]" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#555]">
                Unassigned
              </span>
              <span className="text-[10px] text-[#333]">{noProject.length}</span>
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
      <div className="flex h-full flex-col">
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
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1e1e22] px-6 py-3">
        <div className="flex items-center gap-4">
          <span className="text-xs text-[#555]">
            {tasks.length} tasks total
          </span>
        </div>
        <Button
          size="sm"
          onClick={handleCreateClick}
          className="gap-1.5 bg-indigo-600 text-xs text-white hover:bg-indigo-700"
        >
          <Plus className="h-3.5 w-3.5" />
          New Task
        </Button>
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
