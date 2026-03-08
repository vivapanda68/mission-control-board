"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  supabase,
  type Task,
  type Agent,
  type Activity,
  type Project,
  type TokenUsage,
} from "@/lib/supabase";
import { formatRelativeTime } from "@/lib/format";
import {
  CheckSquare,
  Users,
  Calendar,
  FolderKanban,
  Zap,
  TrendingUp,
  DollarSign,
  Coins,
  BarChart3,
  Lightbulb,
  Clock,
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

// ─── Token & Cost Analysis Components ─────────────────────────────────

const MODEL_COLORS: Record<string, string> = {
  "claude-opus-4-6": "#a855f7",
  "claude-sonnet-4-6": "#3b82f6",
  "kimi-k2": "#10b981",
};

const MODEL_LABELS: Record<string, string> = {
  "claude-opus-4-6": "Opus 4.6",
  "claude-sonnet-4-6": "Sonnet 4.6",
  "kimi-k2": "Kimi K2",
};

function getModelColor(model: string): string {
  return MODEL_COLORS[model] ?? "#666";
}

function getModelLabel(model: string): string {
  return MODEL_LABELS[model] ?? model;
}

function formatCost(cents: number): string {
  if (cents === 0) return "$0.00";
  if (cents < 1) return `$${(cents / 100).toFixed(4)}`;
  if (cents < 100) return `$${(cents / 100).toFixed(2)}`;
  return `$${(cents / 100).toFixed(2)}`;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function CostSummaryCards({ usage }: { usage: TokenUsage[] }) {
  const totalCents = usage.reduce((s, u) => s + u.cost_cents, 0);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const monthCents = usage
    .filter((u) => new Date(u.created_at) >= startOfMonth)
    .reduce((s, u) => s + u.cost_cents, 0);

  const todayCents = usage
    .filter((u) => new Date(u.created_at) >= startOfDay)
    .reduce((s, u) => s + u.cost_cents, 0);

  const sessionIds = new Set(usage.map((u) => u.session_id));
  const avgPerSession =
    sessionIds.size > 0 ? totalCents / sessionIds.size : 0;

  const cards = [
    { label: "Total Spend", value: formatCost(totalCents), icon: DollarSign, color: "#f59e0b" },
    { label: "This Month", value: formatCost(monthCents), icon: Calendar, color: "#6366f1" },
    { label: "Today", value: formatCost(todayCents), icon: Clock, color: "#10b981" },
    { label: "Avg / Session", value: formatCost(avgPerSession), icon: Coins, color: "#06b6d4" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {cards.map((c) => (
        <StatCard key={c.label} label={c.label} value={c.value} icon={c.icon} color={c.color} />
      ))}
    </div>
  );
}

function CostByModel({ usage }: { usage: TokenUsage[] }) {
  const byModel = new Map<string, number>();
  for (const u of usage) {
    byModel.set(u.model, (byModel.get(u.model) ?? 0) + u.cost_cents);
  }

  // Ensure all known models appear
  for (const model of Object.keys(MODEL_COLORS)) {
    if (!byModel.has(model)) byModel.set(model, 0);
  }

  const entries = Array.from(byModel.entries()).sort((a, b) => b[1] - a[1]);
  const maxCents = Math.max(...entries.map(([, c]) => c), 1);

  return (
    <div className="rounded-xl border border-[#1e1e22] bg-[#111113] p-5">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-[#666]" />
        <h3 className="text-xs font-medium text-[#999]">Cost by Model</h3>
      </div>
      <div className="flex flex-col gap-3">
        {entries.map(([model, cents]) => {
          const pct = Math.max(Math.round((cents / maxCents) * 100), cents > 0 ? 4 : 0);
          const isFree = model === "claude-sonnet-4-6";
          return (
            <div key={model}>
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: getModelColor(model) }}
                  />
                  <span className="text-xs text-[#999]">{getModelLabel(model)}</span>
                  {isFree && (
                    <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-medium text-emerald-400">
                      MAX PLAN · FREE
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium text-[#e0e0e0]">
                  {isFree ? "$0.00" : formatCost(cents)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#1e1e22]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: isFree ? "0%" : `${pct}%`,
                    backgroundColor: getModelColor(model),
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TokenUsageChart({ usage }: { usage: TokenUsage[] }) {
  // Build last 7 days
  const days: { label: string; date: string; input: number; output: number; models: Set<string> }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: dateStr,
      input: 0,
      output: 0,
      models: new Set(),
    });
  }

  for (const u of usage) {
    const uDate = u.created_at.slice(0, 10);
    const day = days.find((d) => d.date === uDate);
    if (day) {
      day.input += u.input_tokens;
      day.output += u.output_tokens;
      day.models.add(u.model);
    }
  }

  const maxTokens = Math.max(...days.map((d) => d.input + d.output), 1);

  return (
    <div className="rounded-xl border border-[#1e1e22] bg-[#111113] p-5">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-[#666]" />
        <h3 className="text-xs font-medium text-[#999]">Token Usage (7 days)</h3>
      </div>
      <div className="flex items-end gap-2" style={{ height: 120 }}>
        {days.map((day) => {
          const total = day.input + day.output;
          const totalPct = Math.max((total / maxTokens) * 100, total > 0 ? 4 : 0);
          const inputPct = total > 0 ? (day.input / total) * totalPct : 0;
          const outputPct = totalPct - inputPct;
          const primaryModel = Array.from(day.models)[0];
          return (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="relative flex w-full flex-col justify-end overflow-hidden rounded-t"
                style={{ height: `${totalPct}%`, minHeight: total > 0 ? 4 : 0 }}
              >
                <div
                  className="w-full"
                  style={{
                    height: `${total > 0 ? (day.input / total) * 100 : 0}%`,
                    backgroundColor: primaryModel ? getModelColor(primaryModel) : "#666",
                    opacity: 0.6,
                  }}
                />
                <div
                  className="w-full"
                  style={{
                    height: `${total > 0 ? (day.output / total) * 100 : 0}%`,
                    backgroundColor: primaryModel ? getModelColor(primaryModel) : "#666",
                  }}
                />
              </div>
              <span className="text-[10px] text-[#555]">{day.label}</span>
              {total > 0 && (
                <span className="text-[9px] text-[#444]">{formatTokens(total)}</span>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-sm bg-[#666] opacity-60" />
          <span className="text-[10px] text-[#555]">Input</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-sm bg-[#666]" />
          <span className="text-[10px] text-[#555]">Output</span>
        </div>
      </div>
    </div>
  );
}

function costTier(cents: number): string {
  if (cents === 0) return "text-emerald-400";
  if (cents < 5) return "text-emerald-400";
  if (cents < 50) return "text-amber-400";
  return "text-red-400";
}

function RecentSessions({ usage }: { usage: TokenUsage[] }) {
  // Group by session, take last 10 unique sessions
  const sessionMap = new Map<string, TokenUsage[]>();
  for (const u of usage) {
    const existing = sessionMap.get(u.session_id) ?? [];
    sessionMap.set(u.session_id, [...existing, u]);
  }

  const sessions = Array.from(sessionMap.entries())
    .map(([sessionId, records]) => {
      const totalInput = records.reduce((s, r) => s + r.input_tokens, 0);
      const totalOutput = records.reduce((s, r) => s + r.output_tokens, 0);
      const totalCost = records.reduce((s, r) => s + r.cost_cents, 0);
      const model = records[0].model;
      const task = records[0].task_description;
      const createdAt = records.reduce(
        (latest, r) => (r.created_at > latest ? r.created_at : latest),
        records[0].created_at,
      );
      return { sessionId, model, task, totalInput, totalOutput, totalCost, createdAt };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 10);

  return (
    <div className="rounded-xl border border-[#1e1e22] bg-[#111113] p-5">
      <div className="mb-4 flex items-center gap-2">
        <Clock className="h-4 w-4 text-[#666]" />
        <h3 className="text-xs font-medium text-[#999]">Recent Sessions</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#1e1e22] text-[#555]">
              <th className="pb-2 text-left font-medium">Model</th>
              <th className="pb-2 text-left font-medium">Task</th>
              <th className="pb-2 text-right font-medium">Tokens</th>
              <th className="pb-2 text-right font-medium">Cost</th>
              <th className="pb-2 text-right font-medium">When</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.sessionId} className="border-b border-[#1e1e22]/50 transition-colors hover:bg-[#0a0a0b]">
                <td className="py-2 pr-3">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: getModelColor(s.model) }}
                    />
                    <span className="text-[#e0e0e0]">{getModelLabel(s.model)}</span>
                  </div>
                </td>
                <td className="max-w-[200px] truncate py-2 pr-3 text-[#888]">
                  {s.task ?? "—"}
                </td>
                <td className="py-2 pr-3 text-right text-[#888]">
                  {formatTokens(s.totalInput + s.totalOutput)}
                </td>
                <td className={`py-2 pr-3 text-right font-medium ${costTier(s.totalCost)}`}>
                  {formatCost(s.totalCost)}
                </td>
                <td className="py-2 text-right text-[#555]">
                  {formatRelativeTime(s.createdAt)}
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-center text-[#555]">
                  No sessions recorded yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CostInsights({ usage }: { usage: TokenUsage[] }) {
  const total = usage.length;
  if (total === 0) {
    return (
      <div className="rounded-xl border border-[#1e1e22] bg-[#111113] p-5">
        <div className="mb-4 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <h3 className="text-xs font-medium text-[#999]">Cost Optimization</h3>
        </div>
        <p className="text-xs text-[#555]">No usage data yet — insights will appear here.</p>
      </div>
    );
  }

  const freeCount = usage.filter((u) => u.model === "claude-sonnet-4-6").length;
  const freePct = Math.round((freeCount / total) * 100);

  const totalCost = usage.reduce((s, u) => s + u.cost_cents, 0);
  const opusCost = usage
    .filter((u) => u.model === "claude-opus-4-6")
    .reduce((s, u) => s + u.cost_cents, 0);
  const kimiCost = usage
    .filter((u) => u.model === "kimi-k2")
    .reduce((s, u) => s + u.cost_cents, 0);

  // Estimate savings: if all Kimi tasks had used Opus instead (rough 3x cost estimate)
  const kimiTokens = usage
    .filter((u) => u.model === "kimi-k2")
    .reduce((s, u) => s + u.input_tokens + u.output_tokens, 0);
  const estimatedOpusCostForKimi = kimiCost * 3;
  const kimiSavings = estimatedOpusCostForKimi - kimiCost;

  const insights = [
    {
      label: "Free Claude Code usage",
      value: `${freePct}%`,
      detail: `${freeCount} of ${total} sessions via Max plan (Sonnet)`,
      color: "#10b981",
    },
    {
      label: "Opus spend",
      value: formatCost(opusCost),
      detail: `${totalCost > 0 ? Math.round((opusCost / totalCost) * 100) : 0}% of total cost`,
      color: "#a855f7",
    },
    {
      label: "Kimi K2 savings",
      value: formatCost(kimiSavings),
      detail: kimiSavings > 0
        ? `Saved vs using Opus for ${usage.filter((u) => u.model === "kimi-k2").length} cron sessions`
        : "Using Kimi K2 for cron jobs keeps costs low",
      color: "#10b981",
    },
  ];

  return (
    <div className="rounded-xl border border-[#1e1e22] bg-[#111113] p-5">
      <div className="mb-4 flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-amber-500" />
        <h3 className="text-xs font-medium text-[#999]">Cost Optimization</h3>
      </div>
      <div className="flex flex-col gap-3">
        {insights.map((insight) => (
          <div key={insight.label} className="rounded-lg bg-[#0a0a0b] px-3 py-2.5">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-[#999]">{insight.label}</span>
              <span
                className="text-sm font-semibold"
                style={{ color: insight.color }}
              >
                {insight.value}
              </span>
            </div>
            <p className="text-[10px] text-[#555]">{insight.detail}</p>
          </div>
        ))}
      </div>
      {/* Free vs paid bar */}
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] text-[#555]">Free vs Paid sessions</span>
          <span className="text-[10px] text-emerald-400">{freePct}% free</span>
        </div>
        <div className="flex h-2 overflow-hidden rounded-full bg-[#1e1e22]">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${freePct}%` }}
          />
          <div
            className="h-full bg-amber-500 transition-all duration-500"
            style={{ width: `${100 - freePct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function DashboardView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tokenUsage, setTokenUsage] = useState<TokenUsage[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState(0);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    const [tasksRes, agentsRes, activitiesRes, projectsRes, eventsRes, tokenRes] =
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
        supabase
          .from("token_usage")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(500),
      ]);
    if (tasksRes.data) setTasks(tasksRes.data);
    if (agentsRes.data) setAgents(agentsRes.data);
    if (activitiesRes.data) setActivities(activitiesRes.data);
    if (projectsRes.data) setProjects(projectsRes.data);
    if (tokenRes.data) setTokenUsage(tokenRes.data);
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

        {/* ─── Token & Cost Analysis ─────────────────────────────────── */}
        <div className="mt-10 border-t border-[#1e1e22] pt-8">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-white">
                Token &amp; Cost Analysis
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#555]">
              Usage breakdown across models and sessions
            </p>
          </div>

          {/* Cost summary cards */}
          <div className="mb-6">
            <CostSummaryCards usage={tokenUsage} />
          </div>

          {/* Three-column: Cost by Model / Token Chart / Insights */}
          <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <CostByModel usage={tokenUsage} />
            <TokenUsageChart usage={tokenUsage} />
            <CostInsights usage={tokenUsage} />
          </div>

          {/* Recent sessions table */}
          <RecentSessions usage={tokenUsage} />
        </div>
      </div>
    </ScrollArea>
  );
}
