"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, type Project, type Task, type Activity } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, ArrowLeft } from "lucide-react";
import { ProjectDialog } from "@/components/project-dialog";
import { TaskDialog } from "@/components/task-dialog";
import { formatRelativeTime } from "@/lib/format";

const statusStyles: Record<string, { color: string; bg: string }> = {
  active: { color: "#10b981", bg: "#10b98125" },
  paused: { color: "#f59e0b", bg: "#f59e0b25" },
  completed: { color: "#6366f1", bg: "#6366f125" },
  planning: { color: "#8b5cf6", bg: "#8b5cf625" },
};

const priorityStyles: Record<string, { color: string; label: string }> = {
  low: { color: "#22c55e", label: "Low" },
  medium: { color: "#f59e0b", label: "Medium" },
  high: { color: "#ef4444", label: "High" },
};

// --- Project Detail (drill-down) ---
function ProjectDetail({
  project,
  onBack,
  onEditProject,
}: {
  project: Project;
  onBack: () => void;
  onEditProject: () => void;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchData = useCallback(async () => {
    const [tasksRes, activitiesRes] = await Promise.all([
      supabase
        .from("tasks")
        .select("*, agents(*), projects(*)")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("activities")
        .select("*, agents(*)")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);
    if (tasksRes.data) setTasks(tasksRes.data);
    // Filter activities related to this project
    if (activitiesRes.data) {
      const projectActivities = activitiesRes.data.filter(
        (a) =>
          (a.metadata as Record<string, unknown>)?.project_id === project.id ||
          tasks.some(
            (t) =>
              t.id === (a.metadata as Record<string, unknown>)?.task_id
          )
      );
      setActivities(
        projectActivities.length > 0 ? projectActivities : activitiesRes.data.slice(0, 5)
      );
    }
    setLoading(false);
  }, [project.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const status = statusStyles[project.status] ?? statusStyles.active;
  const backlog = tasks.filter((t) => t.status === "backlog" || t.status === "recurring").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const done = tasks.filter((t) => t.status === "done").length;

  return (
    <ScrollArea className="h-full">
      <div className="p-4 md:p-6">
        {/* Back button + header */}
        <div className="mb-5 md:mb-6">
          <button
            onClick={onBack}
            className="mb-3 flex min-h-[44px] items-center gap-1.5 text-sm text-[#a0a0a0] transition-colors hover:text-white active:text-white md:min-h-0 md:text-xs"
          >
            <ArrowLeft className="h-4 w-4 md:h-3 md:w-3" />
            Back to Projects
          </button>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-white md:text-lg">
                  {project.name}
                </h2>
                <Badge
                  variant="outline"
                  className="border-transparent px-1.5 py-0 text-[11px] capitalize"
                  style={{ backgroundColor: status.bg, color: status.color }}
                >
                  {project.status}
                </Badge>
              </div>
              {project.description && (
                <p className="mt-1 text-sm text-[#a0a0a0] md:text-xs">
                  {project.description}
                </p>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={onEditProject}
              className="h-10 self-start text-sm text-[#b0b0b0] hover:bg-[#252529] hover:text-white md:h-8 md:text-xs"
            >
              Edit Project
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-5 grid grid-cols-3 gap-3 md:mb-6 md:gap-4">
          <div className="rounded-lg border border-[#252529] bg-[#131316] p-3">
            <span className="text-xs text-[#888] md:text-[11px]">Backlog</span>
            <p className="text-xl font-semibold text-white md:text-lg">{backlog}</p>
          </div>
          <div className="rounded-lg border border-[#252529] bg-[#131316] p-3">
            <span className="text-xs text-[#888] md:text-[11px]">In Progress</span>
            <p className="text-xl font-semibold text-white md:text-lg">{inProgress}</p>
          </div>
          <div className="rounded-lg border border-[#252529] bg-[#131316] p-3">
            <span className="text-xs text-[#888] md:text-[11px]">Done</span>
            <p className="text-xl font-semibold text-white md:text-lg">{done}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-5 md:mb-6">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-sm text-[#b0b0b0] md:text-xs">Progress</span>
            <span className="text-sm font-medium text-white md:text-xs">
              {project.progress_percent}%
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#252529] md:h-2">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${project.progress_percent}%`,
                backgroundColor: status.color,
              }}
            />
          </div>
        </div>

        {/* Tasks list */}
        <div className="mb-5 md:mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-white md:text-sm">Tasks</h3>
            <Button
              size="sm"
              onClick={() => {
                setEditingTask(null);
                setTaskDialogOpen(true);
              }}
              className="h-9 gap-1.5 bg-indigo-600 px-4 text-sm text-white hover:bg-indigo-700 md:h-8 md:px-3 md:text-xs"
            >
              <Plus className="h-4 w-4 md:h-3 md:w-3" />
              Add Task
            </Button>
          </div>
          {loading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg border border-[#252529] bg-[#131316]" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {tasks.map((task) => {
                const priority = priorityStyles[task.priority] ?? priorityStyles.medium;
                return (
                  <div
                    key={task.id}
                    className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-lg border border-[#252529] bg-[#131316] px-3.5 py-3 transition-colors hover:border-[#3a3a3e] active:bg-[#1a1a1e] md:px-4"
                    onClick={() => {
                      setEditingTask(task);
                      setTaskDialogOpen(true);
                    }}
                  >
                    <div
                      className="h-2.5 w-2.5 flex-shrink-0 rounded-full md:h-2 md:w-2"
                      style={{ backgroundColor: priority.color }}
                    />
                    <span className="flex-1 truncate text-sm text-[#f0f0f0]">
                      {task.title}
                    </span>
                    <Badge
                      variant="outline"
                      className="border-transparent bg-[#252529] px-1.5 py-0 text-[11px] capitalize text-[#a0a0a0]"
                    >
                      {task.status.replace("_", " ")}
                    </Badge>
                    {task.agents?.name && (
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white md:h-5 md:w-5"
                        style={{ backgroundColor: task.agents.color }}
                      >
                        {task.agents.name[0]}
                      </div>
                    )}
                  </div>
                );
              })}
              {tasks.length === 0 && (
                <span className="text-sm text-[#777] md:text-xs">No tasks yet</span>
              )}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="mb-3 text-base font-semibold text-white md:text-sm">
            Recent Activity
          </h3>
          <div className="flex flex-col gap-1">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-[#131316] md:py-2"
              >
                <div
                  className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white md:h-5 md:w-5 md:text-[10px]"
                  style={{ backgroundColor: activity.agents?.color ?? "#777" }}
                >
                  {(activity.agents?.name ?? "?")[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[#a0a0a0] md:text-xs">
                    <span
                      className="font-medium"
                      style={{ color: activity.agents?.color ?? "#777" }}
                    >
                      {activity.agents?.name ?? "System"}
                    </span>{" "}
                    {activity.action}{" "}
                    <span className="text-[#ddd]">{activity.description}</span>
                  </p>
                  <span className="text-xs text-[#666] md:text-[11px]">
                    {formatRelativeTime(activity.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        task={editingTask}
        onSaved={fetchData}
      />
    </ScrollArea>
  );
}

// --- Main Projects View ---
export function ProjectsView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const fetchData = useCallback(async () => {
    const { data } = await supabase
      .from("projects")
      .select("*, agents(*)")
      .order("created_at", { ascending: false });
    if (data) setProjects(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleCreateClick() {
    setEditingProject(null);
    setDialogOpen(true);
  }

  function handleEditClick(project: Project) {
    setEditingProject(project);
    setDialogOpen(true);
  }

  // If a project is selected, show detail view
  if (selectedProject) {
    return (
      <ProjectDetail
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
        onEditProject={() => handleEditClick(selectedProject)}
      />
    );
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="mb-6">
          <div className="mb-2 h-4 w-32 animate-pulse rounded bg-[#252529]" />
          <div className="h-3 w-48 animate-pulse rounded bg-[#252529]" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl border border-[#252529] bg-[#131316]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 md:p-6">
        <div className="mb-5 flex items-center justify-between md:mb-6">
          <div>
            <h2 className="text-base font-semibold text-white md:text-sm">Projects</h2>
            <p className="mt-0.5 text-sm text-[#888] md:text-xs">
              {projects.filter((p) => p.status === "active").length} active ·{" "}
              {projects.length} total
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleCreateClick}
            className="h-9 gap-1.5 bg-indigo-600 px-4 text-sm text-white hover:bg-indigo-700 md:h-8 md:px-3 md:text-xs"
          >
            <Plus className="h-4 w-4 md:h-3.5 md:w-3.5" />
            New Project
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-3">
          {projects.map((project) => {
            const status = statusStyles[project.status] ?? statusStyles.active;
            const priority = priorityStyles[project.priority] ?? priorityStyles.medium;
            return (
              <div
                key={project.id}
                className="group cursor-pointer rounded-xl border border-[#252529] bg-[#131316] p-4 transition-colors hover:border-[#3a3a3e] active:bg-[#1a1a1e] md:p-5"
                onClick={() => setSelectedProject(project)}
              >
                {/* Header */}
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="text-base font-semibold text-white md:text-sm">
                        {project.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-transparent px-1.5 py-0 text-[11px] capitalize"
                        style={{
                          backgroundColor: status.bg,
                          color: status.color,
                        }}
                      >
                        {project.status.replace("_", " ")}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-transparent px-1.5 py-0 text-[11px]"
                        style={{
                          backgroundColor: `${priority.color}18`,
                          color: priority.color,
                        }}
                      >
                        {priority.label}
                      </Badge>
                    </div>
                  </div>
                  {project.agents?.name && (
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white md:h-7 md:w-7 md:text-[11px]"
                      style={{ backgroundColor: project.agents?.color ?? "#777" }}
                    >
                      {project.agents.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Description */}
                {project.description && (
                  <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[#a0a0a0] md:text-xs">
                    {project.description}
                  </p>
                )}

                {/* Progress */}
                <div className="mb-2">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs text-[#888] md:text-[11px]">Progress</span>
                    <span className="text-xs font-medium text-[#b0b0b0] md:text-[11px]">
                      {project.progress_percent}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#252529] md:h-1.5">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${project.progress_percent}%`,
                        backgroundColor: project.agents?.color ?? status.color,
                      }}
                    />
                  </div>
                </div>

                {/* Task count + last activity */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#888] md:text-[11px]">
                    {project.completed_tasks}/{project.total_tasks} tasks
                  </span>
                  <span className="text-xs text-[#666] md:text-[11px]">
                    {formatRelativeTime(project.updated_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={editingProject}
        onSaved={fetchData}
      />
    </ScrollArea>
  );
}
