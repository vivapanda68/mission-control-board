"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  supabase,
  type Task,
  type Agent,
  type Activity,
  type Project,
} from "@/lib/supabase";
import { formatRelativeTime } from "@/lib/format";
import {
  CheckSquare,
  Users,
  Calendar,
  FolderKanban,
  Zap,
  TrendingUp,
} from "lucide-react";

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-[#1e1e22] ${className ?? ""}`}
    />
  );
}

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
    <div className="rounded-xl border border-[#1e1e22] bg-[#111113] p-4 transition-colors hover:border-[#2a2a2e]">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4" style={{ color }} />
        <span className="text-xs text-[#666]">{label}</span>
      </div>
      <span className="text-2xl font-semibold text-white">{value}</span>
    </div>
  );
}

function TaskBreakdown({ tasks }: { tasks: Task[] }) {
  const statusConfig: {
    status: string;
    label: string;
    color: string;
  }[] = [
    { status: "recurring", label: "Recurring", color: "#6366f1" },
    { status: "backlog", label: "Backlog", color: "#666" },
    { status: "in_progress", label: "In Progress", color: "#10b981" },
    { status: "review", label: "Review", color: "#f59e0b" },
    { status: "done", label: "Done", color: "#06b6d4" },
  ];

  const total = tasks.length || 1;

  return (
    <div className="rounded-xl border border-[#1e1e22] bg-[#111113] p-5">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-[#666]" />
        <h3 className="text-xs font-medium text-[#999]">Task Breakdown</h3>
      </div>
      <div className="flex flex-col gap-3">
        {statusConfig.map((cfg) => {
          const count = tasks.filter((t) => t.status === cfg.status).length;
          const pct = Math.round((count / total) * 100);
          return (
            <div key={cfg.status}>
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: cfg.color }}
                  />
                  <span className="text-xs text-[#999]">{cfg.label}</span>
                </div>
                <span className="text-xs font-medium text-[#e0e0e0]">
                  {count}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#1e1e22]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: cfg.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AgentStatusOverview({ agents }: { agents: Agent[] }) {
  const statusGroups: {
    status: string;
    label: string;
    color: string;
    dotClass: string;
  }[] = [
    { status: "working", label: "Working", color: "#10b981", dotClass: "bg-emerald-500" },
    { status: "idle", label: "Idle", color: "#f59e0b", dotClass: "bg-amber-500" },
    { status: "paused", label: "Paused", color: "#6366f1", dotClass: "bg-indigo-500" },
    { status: "offline", label: "Offline", color: "#666", dotClass: "bg-gray-500" },
  ];

  return (
    <div className="rounded-xl border border-[#1e1e22] bg-[#111113] p-5">
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-4 w-4 text-[#666]" />
        <h3 className="text-xs font-medium text-[#999]">Agent Status</h3>
      </div>
      <div className="flex flex-col gap-2">
        {agents.map((agent) => {
          const group = statusGroups.find((g) => g.status === agent.status);
          return (
            <div
              key={agent.id}
              className="flex items-center gap-3 rounded-lg bg-[#0a0a0b] px-3 py-2"
            >
              <div
                className="flex h-6 w-6 items-center justify-center rounded-md text-[9px] font-bold text-white"
                style={{ backgroundColor: agent.color }}
              >
                {agent.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-[#e0e0e0]">
                  {agent.name}
                </span>
                {agent.current_task && (
                  <p className="truncate text-[10px] text-[#555]">
                    {agent.current_task}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`h-1.5 w-1.5 rounded-full ${group?.dotClass ?? "bg-gray-500"}`} />
                <span className="text-[10px] capitalize text-[#888]">
                  {agent.status}
                </span>
              </div>
            </div>
          );
        })}
        {agents.length === 0 && (
          <span className="text-xs text-[#555]">No agents registered</span>
        )}
      </div>
    </div>
  );
}

function ActivityFeed({
  activities,
  loading,
}: {
  activities: Activity[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3 px-1">
            <SkeletonPulse className="h-6 w-6 flex-shrink-0 rounded-full" />
            <div className="flex-1">
              <SkeletonPulse className="mb-1 h-3 w-3/4" />
              <SkeletonPulse className="h-2 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="group flex gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-[#0a0a0b]"
        >
          <div
            className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white"
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
                {activity.agents?.name ?? "System"}
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
      {activities.length === 0 && (
        <span className="px-2 text-xs text-[#555]">No recent activity</span>
      )}
    </div>
  );
}

export function DashboardView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState(0);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    const [tasksRes, agentsRes, activitiesRes, projectsRes, eventsRes] =
      await Promise.all([
        supabase.from("tasks").select("*"),
        supabase.from("agents").select("*"),
        supabase
          .from("activities")
          .select("*, agents(*)")
          .order("created_at", { ascending: false })
          .limit(10),
        supabase.from("projects").select("*"),
        supabase
          .from("schedules")
          .select("id", { count: "exact", head: true }),
      ]);
    if (tasksRes.data) setTasks(tasksRes.data);
    if (agentsRes.data) setAgents(agentsRes.data);
    if (activitiesRes.data) setActivities(activitiesRes.data);
    if (projectsRes.data) setProjects(projectsRes.data);
    setUpcomingEvents(eventsRes.count ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData]);

  const activeAgents = agents.filter((a) => a.status === "working").length;
  const activeProjects = projects.filter((p) => p.status === "active").length;

  if (loading) {
    return (
      <ScrollArea className="h-full">
        <div className="p-6">
          <div className="mb-6">
            <SkeletonPulse className="mb-2 h-5 w-40" />
            <SkeletonPulse className="h-3 w-64" />
          </div>
          <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-[#1e1e22] bg-[#111113] p-4"
              >
                <SkeletonPulse className="mb-3 h-4 w-20" />
                <SkeletonPulse className="h-7 w-12" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="rounded-xl border border-[#1e1e22] bg-[#111113] p-5">
              <SkeletonPulse className="mb-4 h-4 w-32" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="mb-3">
                  <SkeletonPulse className="mb-1 h-3 w-full" />
                  <SkeletonPulse className="h-1.5 w-full" />
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-[#1e1e22] bg-[#111113] p-5">
              <SkeletonPulse className="mb-4 h-4 w-32" />
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonPulse key={i} className="mb-2 h-10 w-full" />
              ))}
            </div>
            <div className="rounded-xl border border-[#1e1e22] bg-[#111113] p-5">
              <SkeletonPulse className="mb-4 h-4 w-32" />
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
      <div className="p-6">
        <div className="mb-6">
          <h2 className="mb-1 text-sm font-semibold text-white">
            Dashboard Overview
          </h2>
          <p className="text-xs text-[#555]">
            Real-time summary of your mission control
          </p>
        </div>

        {/* Stats cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard
            label="Total Tasks"
            value={tasks.length}
            icon={CheckSquare}
            color="#6366f1"
          />
          <StatCard
            label="Active Agents"
            value={`${activeAgents}/${agents.length}`}
            icon={Users}
            color="#10b981"
          />
          <StatCard
            label="Scheduled Events"
            value={upcomingEvents}
            icon={Calendar}
            color="#f59e0b"
          />
          <StatCard
            label="Active Projects"
            value={activeProjects}
            icon={FolderKanban}
            color="#06b6d4"
          />
        </div>

        {/* Three-column layout */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Task breakdown */}
          <TaskBreakdown tasks={tasks} />

          {/* Agent status */}
          <AgentStatusOverview agents={agents} />

          {/* Recent activity */}
          <div className="rounded-xl border border-[#1e1e22] bg-[#111113] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-500" />
              <h3 className="text-xs font-medium text-[#999]">
                Recent Activity
              </h3>
              <div className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            </div>
            <ActivityFeed activities={activities} loading={false} />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
