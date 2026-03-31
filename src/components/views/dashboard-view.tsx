"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  supabase,
  type Task,
  type Agent,
  type Activity,
  type Project,
} from "@/lib/supabase";
import { formatRelativeTime } from "@/lib/format";
import {
  FolderKanban,
  Loader2,
  CheckCircle2,
  ListTodo,
  Zap,
} from "lucide-react";
import { TaskDialog } from "@/components/task-dialog";

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-[#252529] ${className ?? ""}`}
    />
  );
}

// --- Stat Card ---
function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-[#252529] bg-[#131316] p-3.5 transition-colors hover:border-[#3a3a3e] md:p-4">
      <div className="mb-2 flex items-center gap-2 md:mb-3">
        <Icon className="h-4 w-4 md:h-4 md:w-4" style={{ color }} />
        <span className="text-xs text-[#888] md:text-xs">{label}</span>
      </div>
      <span className="text-2xl font-bold text-white md:text-3xl">{value}</span>
    </div>
  );
}

// --- Priority indicator ---
const priorityConfig: Record<string, { color: string; label: string }> = {
  high: { color: "#ef4444", label: "High" },
  medium: { color: "#f59e0b", label: "Med" },
  low: { color: "#22c55e", label: "Low" },
};

// --- Sprint Section ---
function SprintSection({
  tasks,
  agents,
  onEditTask,
}: {
  tasks: Task[];
  agents: Agent[];
  onEditTask: (task: Task) => void;
}) {
  const inProgress = tasks
    .filter((t) => t.status === "in_progress")
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return (order[a.priority] ?? 1) - (order[b.priority] ?? 1);
    });

  const inReview = tasks
    .filter((t) => t.status === "review")
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return (order[a.priority] ?? 1) - (order[b.priority] ?? 1);
    });

  const agentMap = new Map(agents.map((a) => [a.id, a]));

  function TaskRow({ task }: { task: Task }) {
    const agent = task.assignee_id ? agentMap.get(task.assignee_id) : null;
    const priority = priorityConfig[task.priority] ?? priorityConfig.medium;
    const project = task.projects;

    return (
      <div
        className="group flex min-h-[48px] cursor-pointer items-center gap-3 rounded-lg border border-[#252529] bg-[#131316] px-3.5 py-3 transition-colors hover:border-[#3a3a3e] active:bg-[#1a1a1e] md:px-4"
        onClick={() => onEditTask(task)}
      >
        <div
          className="h-2.5 w-2.5 flex-shrink-0 rounded-full md:h-2 md:w-2"
          style={{ backgroundColor: priority.color }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-[#f0f0f0]">
              {task.title}
            </span>
            {project && (
              <Badge
                variant="outline"
                className="hidden border-transparent bg-[#252529] px-1.5 py-0 text-[11px] text-[#a0a0a0] sm:inline-flex"
              >
                {project.name}
              </Badge>
            )}
          </div>
          {/* Show project name below title on mobile */}
          {project && (
            <span className="mt-0.5 block text-xs text-[#777] sm:hidden">
              {project.name}
            </span>
          )}
        </div>
        {agent && (
          <div
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white md:h-6 md:w-6"
            style={{ backgroundColor: agent.color }}
          >
            {agent.name[0]}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      {/* In Progress */}
      <div>
        <div className="mb-2.5 flex items-center gap-2 md:mb-3">
          <Loader2 className="h-4 w-4 text-emerald-500 md:h-3.5 md:w-3.5" />
          <span className="text-sm font-medium text-[#b0b0b0] md:text-xs">In Progress</span>
          <span className="text-sm text-[#666] md:text-xs">{inProgress.length}</span>
        </div>
        <div className="flex flex-col gap-2">
          {inProgress.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
          {inProgress.length === 0 && (
            <span className="text-sm text-[#777] md:text-xs">No tasks in progress</span>
          )}
        </div>
      </div>

      {/* In Review */}
      <div>
        <div className="mb-2.5 flex items-center gap-2 md:mb-3">
          <CheckCircle2 className="h-4 w-4 text-amber-500 md:h-3.5 md:w-3.5" />
          <span className="text-sm font-medium text-[#b0b0b0] md:text-xs">In Review</span>
          <span className="text-sm text-[#666] md:text-xs">{inReview.length}</span>
        </div>
        <div className="flex flex-col gap-2">
          {inReview.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
          {inReview.length === 0 && (
            <span className="text-sm text-[#777] md:text-xs">No tasks in review</span>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Activity Feed ---
function ActivityFeed({ activities }: { activities: Activity[] }) {
  return (
    <div className="flex flex-col gap-1">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="group flex gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-[#131316] md:py-2"
        >
          <div
            className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white md:h-6 md:w-6 md:text-[10px]"
            style={{ backgroundColor: activity.agents?.color ?? "#777" }}
          >
            {(activity.agents?.name ?? "?")[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-relaxed text-[#a0a0a0] md:text-xs">
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
      {activities.length === 0 && (
        <span className="px-2 text-sm text-[#777] md:text-xs">No recent activity</span>
      )}
    </div>
  );
}

// --- Project Health ---
const statusStyles: Record<string, { color: string; bg: string }> = {
  active: { color: "#10b981", bg: "#10b98125" },
  paused: { color: "#f59e0b", bg: "#f59e0b25" },
  completed: { color: "#6366f1", bg: "#6366f125" },
  planning: { color: "#8b5cf6", bg: "#8b5cf625" },
};

function ProjectHealth({ projects }: { projects: Project[] }) {
  const active = projects.filter(
    (p) => p.status === "active" || p.status === "planning"
  );

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {active.map((project) => {
        const status = statusStyles[project.status] ?? statusStyles.active;
        return (
          <div
            key={project.id}
            className="rounded-xl border border-[#252529] bg-[#131316] p-4 transition-colors hover:border-[#3a3a3e]"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-white">
                {project.name}
              </span>
              <Badge
                variant="outline"
                className="border-transparent px-1.5 py-0 text-[11px] capitalize"
                style={{ backgroundColor: status.bg, color: status.color }}
              >
                {project.status}
              </Badge>
            </div>
            <div className="mb-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#252529]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${project.progress_percent}%`,
                    backgroundColor: status.color,
                  }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#888] md:text-[11px]">
                {project.completed_tasks}/{project.total_tasks} tasks
              </span>
              <span className="text-xs text-[#888] md:text-[11px]">
                {project.progress_percent}%
              </span>
            </div>
          </div>
        );
      })}
      {active.length === 0 && (
        <span className="text-sm text-[#777] md:text-xs">No active projects</span>
      )}
    </div>
  );
}

// --- Main Dashboard ---
export function DashboardView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    const [tasksRes, agentsRes, activitiesRes, projectsRes] =
      await Promise.all([
        supabase.from("tasks").select("*, agents(*), projects(*)"),
        supabase.from("agents").select("*"),
        supabase
          .from("activities")
          .select("*, agents(*)")
          .order("created_at", { ascending: false })
          .limit(15),
        supabase.from("projects").select("*"),
      ]);
    if (tasksRes.data) setTasks(tasksRes.data);
    if (agentsRes.data) setAgents(agentsRes.data);
    if (activitiesRes.data) setActivities(activitiesRes.data);
    if (projectsRes.data) setProjects(projectsRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData]);

  function handleEditTask(task: Task) {
    setEditingTask(task);
    setDialogOpen(true);
  }

  const activeProjects = projects.filter((p) => p.status === "active").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const backlogCount = tasks.filter(
    (t) => t.status === "backlog" || t.status === "recurring"
  ).length;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const completedThisMonth = tasks.filter(
    (t) =>
      t.status === "done" &&
      new Date(t.updated_at) >= startOfMonth
  ).length;

  if (loading) {
    return (
      <ScrollArea className="h-full">
        <div className="p-4 md:p-6">
          <div className="mb-6">
            <SkeletonPulse className="mb-2 h-5 w-40" />
            <SkeletonPulse className="h-3 w-64" />
          </div>
          <div className="mb-8 grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-[#252529] bg-[#131316] p-4">
                <SkeletonPulse className="mb-3 h-4 w-20" />
                <SkeletonPulse className="h-7 w-12" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
            <div className="xl:col-span-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonPulse key={i} className="mb-2 h-14 w-full" />
              ))}
            </div>
            <div className="xl:col-span-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="mb-3 flex gap-3">
                  <SkeletonPulse className="h-6 w-6 rounded-full" />
                  <div className="flex-1">
                    <SkeletonPulse className="mb-1 h-3 w-3/4" />
                    <SkeletonPulse className="h-2 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 md:p-6">
        {/* Top Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:mb-8 md:gap-4 xl:grid-cols-4">
          <StatCard
            label="Active Projects"
            value={activeProjects}
            icon={FolderKanban}
            color="#6366f1"
          />
          <StatCard
            label="In Progress"
            value={inProgressCount}
            icon={Loader2}
            color="#10b981"
          />
          <StatCard
            label="Backlog"
            value={backlogCount}
            icon={ListTodo}
            color="#f59e0b"
          />
          <StatCard
            label="Done This Month"
            value={completedThisMonth}
            icon={CheckCircle2}
            color="#06b6d4"
          />
        </div>

        {/* Main content: Sprint (60%) + Activity (40%) — stacked on mobile */}
        <div className="mb-6 grid grid-cols-1 gap-6 md:mb-8 xl:grid-cols-5">
          {/* Left: Current Sprint */}
          <div className="xl:col-span-3">
            <div className="mb-3 md:mb-4">
              <h2 className="text-base font-semibold text-white md:text-sm">
                Current Sprint
              </h2>
              <p className="mt-0.5 text-sm text-[#888] md:text-xs">
                Active and review tasks sorted by priority
              </p>
            </div>
            <SprintSection
              tasks={tasks}
              agents={agents}
              onEditTask={handleEditTask}
            />
          </div>

          {/* Right: Activity Feed */}
          <div className="xl:col-span-2">
            <div className="rounded-xl border border-[#252529] bg-[#131316] p-4 md:p-5">
              <div className="mb-3 flex items-center gap-2 md:mb-4">
                <Zap className="h-4 w-4 text-emerald-500" />
                <h3 className="text-sm font-medium text-[#b0b0b0] md:text-xs">
                  Recent Activity
                </h3>
                <div className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              </div>
              <ActivityFeed activities={activities} />
            </div>
          </div>
        </div>

        {/* Bottom: Project Health */}
        <div>
          <div className="mb-3 md:mb-4">
            <h2 className="text-base font-semibold text-white md:text-sm">
              Project Health
            </h2>
            <p className="mt-0.5 text-sm text-[#888] md:text-xs">
              Active and planning projects at a glance
            </p>
          </div>
          <ProjectHealth projects={projects} />
        </div>
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        onSaved={fetchData}
      />
    </ScrollArea>
  );
}
