"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar, type ViewId } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { DashboardView } from "@/components/views/dashboard-view";
import { TasksView } from "@/components/views/tasks-view";
import { CalendarView } from "@/components/views/calendar-view";
import { TeamView } from "@/components/views/team-view";
import { ProjectsView } from "@/components/views/projects-view";
import { MemoryView } from "@/components/views/memory-view";
import { DocsView } from "@/components/views/docs-view";
import { OfficeView } from "@/components/views/office-view";
import { CommandPalette } from "@/components/command-palette";
import { supabase, type Agent } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings, Activity, Cpu, HardDrive, Wifi, Coins } from "lucide-react";
import { AgentDialog } from "@/components/agent-dialog";

function AgentsView() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const fetchData = useCallback(async () => {
    const { data } = await supabase.from("agents").select("*");
    if (data) setAgents(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleEditClick(agent: Agent) {
    setEditingAgent(agent);
    setDialogOpen(true);
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="mb-2 h-4 w-32 animate-pulse rounded bg-[#1e1e22]" />
          <div className="h-3 w-48 animate-pulse rounded bg-[#1e1e22]" />
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg border border-[#1e1e22] bg-[#111113]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        <h2 className="mb-1 text-sm font-semibold text-white">
          Agent Overview
        </h2>
        <p className="mb-6 text-xs text-[#555]">
          Real-time status of all registered agents
        </p>
        <div className="flex flex-col gap-2">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="flex cursor-pointer items-center gap-4 rounded-lg border border-[#1e1e22] bg-[#111113] px-4 py-3 transition-colors hover:border-[#2a2a2e]"
              onClick={() => handleEditClick(agent)}
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                style={{ backgroundColor: agent.color }}
              >
                {agent.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">
                    {agent.name}
                  </span>
                  <span className="text-xs text-[#555]">{agent.role}</span>
                </div>
                {agent.current_task && (
                  <span className="text-xs text-[#666]">
                    Working on: {agent.current_task}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    agent.status === "working"
                      ? "bg-emerald-500"
                      : agent.status === "idle"
                        ? "bg-amber-500"
                        : agent.status === "paused"
                          ? "bg-indigo-500"
                          : "bg-gray-500"
                  }`}
                />
                <span className="text-xs capitalize text-[#888]">
                  {agent.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AgentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        agent={editingAgent}
        onSaved={fetchData}
      />
    </ScrollArea>
  );
}

type TokenUsage = {
  model: string;
  provider: string;
  input_tokens: number;
  output_tokens: number;
  cost_cents: number;
  created_at: string;
};

const mockTokenUsage: TokenUsage[] = [
  { model: "Opus 4.6", provider: "Anthropic", input_tokens: 1_240_000, output_tokens: 380_000, cost_cents: 3720, created_at: "2026-03-03" },
  { model: "Kimi K2", provider: "Moonshot", input_tokens: 890_000, output_tokens: 210_000, cost_cents: 1540, created_at: "2026-03-03" },
  { model: "Claude Code", provider: "Anthropic", input_tokens: 2_100_000, output_tokens: 620_000, cost_cents: 5480, created_at: "2026-03-03" },
  { model: "Sonnet 4.6", provider: "Anthropic", input_tokens: 560_000, output_tokens: 140_000, cost_cents: 890, created_at: "2026-03-02" },
];

function TokenUsageSection() {
  const totalCost = mockTokenUsage.reduce((sum, u) => sum + u.cost_cents, 0);
  const totalInput = mockTokenUsage.reduce((sum, u) => sum + u.input_tokens, 0);
  const totalOutput = mockTokenUsage.reduce((sum, u) => sum + u.output_tokens, 0);
  const maxCost = Math.max(...mockTokenUsage.map((u) => u.cost_cents));

  const modelColors: Record<string, string> = {
    "Opus 4.6": "#8b5cf6",
    "Kimi K2": "#06b6d4",
    "Claude Code": "#6366f1",
    "Sonnet 4.6": "#10b981",
  };

  function formatTokens(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return String(n);
  }

  return (
    <div className="mb-8 rounded-xl border border-[#1e1e22] bg-[#111113] p-5">
      <div className="mb-4 flex items-center gap-2">
        <Coins className="h-4 w-4 text-[#f59e0b]" />
        <h3 className="text-xs font-medium text-[#999]">Token Usage & Cost</h3>
        <span className="ml-auto text-xs text-[#555]">Today</span>
      </div>

      {/* Summary row */}
      <div className="mb-5 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-[#0a0a0b] p-3">
          <span className="text-[10px] text-[#555]">Total Cost</span>
          <p className="text-lg font-semibold text-white">${(totalCost / 100).toFixed(2)}</p>
        </div>
        <div className="rounded-lg bg-[#0a0a0b] p-3">
          <span className="text-[10px] text-[#555]">Input Tokens</span>
          <p className="text-lg font-semibold text-white">{formatTokens(totalInput)}</p>
        </div>
        <div className="rounded-lg bg-[#0a0a0b] p-3">
          <span className="text-[10px] text-[#555]">Output Tokens</span>
          <p className="text-lg font-semibold text-white">{formatTokens(totalOutput)}</p>
        </div>
      </div>

      {/* Per-model breakdown */}
      <div className="flex flex-col gap-3">
        {mockTokenUsage.map((usage) => {
          const pct = Math.round((usage.cost_cents / maxCost) * 100);
          const color = modelColors[usage.model] ?? "#666";
          return (
            <div key={usage.model}>
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-[#e0e0e0]">{usage.model}</span>
                  <span className="text-[10px] text-[#555]">{usage.provider}</span>
                </div>
                <span className="text-xs font-medium text-white">
                  ${(usage.cost_cents / 100).toFixed(2)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#1e1e22]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
              <div className="mt-0.5 flex gap-4 text-[10px] text-[#555]">
                <span>In: {formatTokens(usage.input_tokens)}</span>
                <span>Out: {formatTokens(usage.output_tokens)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SystemView() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from("agents").select("*");
      if (data) setAgents(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const activeCount = agents.filter((a) => a.status === "working").length;
  const metrics = [
    {
      label: "Agent Pool",
      value: loading ? "..." : `${activeCount}/${agents.length}`,
      icon: Cpu,
      color: "#6366f1",
    },
    {
      label: "Task Queue",
      value: "14 tasks",
      icon: Activity,
      color: "#10b981",
    },
    {
      label: "Memory Usage",
      value: "2.4 GB",
      icon: HardDrive,
      color: "#f59e0b",
    },
    {
      label: "API Latency",
      value: "120ms",
      icon: Wifi,
      color: "#06b6d4",
    },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        <div className="mb-1 flex items-center gap-2">
          <Settings className="h-4 w-4 text-[#666]" />
          <h2 className="text-sm font-semibold text-white">System Status</h2>
        </div>
        <p className="mb-6 text-xs text-[#555]">
          Infrastructure and runtime metrics
        </p>

        <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="rounded-xl border border-[#1e1e22] bg-[#111113] p-4"
              >
                <div className="mb-3 flex items-center gap-2">
                  <Icon
                    className="h-4 w-4"
                    style={{ color: metric.color }}
                  />
                  <span className="text-xs text-[#666]">{metric.label}</span>
                </div>
                <span className="text-lg font-semibold text-white">
                  {metric.value}
                </span>
              </div>
            );
          })}
        </div>

        {/* Token / Cost Tracking */}
        <TokenUsageSection />

        <div className="rounded-xl border border-[#1e1e22] bg-[#111113] p-5">
          <h3 className="mb-4 text-xs font-medium text-[#999]">
            Service Health
          </h3>
          <div className="flex flex-col gap-3">
            {[
              { name: "API Gateway", status: "healthy", uptime: "99.98%" },
              {
                name: "Agent Orchestrator",
                status: "healthy",
                uptime: "99.95%",
              },
              {
                name: "Knowledge Store",
                status: "healthy",
                uptime: "99.99%",
              },
              { name: "Task Queue", status: "healthy", uptime: "100%" },
              {
                name: "Redis (Message Bus)",
                status: "healthy",
                uptime: "99.97%",
              },
              {
                name: "PostgreSQL",
                status: "degraded",
                uptime: "99.91%",
              },
            ].map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between rounded-lg bg-[#0a0a0b] px-4 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`h-1.5 w-1.5 rounded-full ${
                      service.status === "healthy"
                        ? "bg-emerald-500"
                        : "bg-amber-500"
                    }`}
                  />
                  <span className="text-xs text-[#e0e0e0]">
                    {service.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-[#555]">
                    {service.uptime}
                  </span>
                  <Badge
                    variant="outline"
                    className={`border-transparent px-1.5 py-0 text-[10px] ${
                      service.status === "healthy"
                        ? "bg-[#10b98118] text-emerald-500"
                        : "bg-[#f59e0b18] text-amber-500"
                    }`}
                  >
                    {service.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

const viewComponents: Record<ViewId, React.ComponentType> = {
  dashboard: DashboardView,
  tasks: TasksView,
  agents: AgentsView,
  calendar: CalendarView,
  projects: ProjectsView,
  memory: MemoryView,
  docs: DocsView,
  team: TeamView,
  office: OfficeView,
  system: SystemView,
};

export default function Home() {
  const [activeView, setActiveView] = useState<ViewId>("dashboard");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const ViewComponent = viewComponents[activeView];

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0b]">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          activeView={activeView}
          onCommandPaletteOpen={() => setCommandPaletteOpen(true)}
        />
        <main key={activeView} className="view-transition flex-1 overflow-hidden">
          <ViewComponent />
        </main>
      </div>
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onViewChange={(view) => {
          setActiveView(view);
          setCommandPaletteOpen(false);
        }}
      />
    </div>
  );
}
