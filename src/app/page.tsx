"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar, type ViewId } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { TasksView } from "@/components/views/tasks-view";
import { CalendarView } from "@/components/views/calendar-view";
import { TeamView } from "@/components/views/team-view";
import { ProjectsView } from "@/components/views/projects-view";
import { MemoryView } from "@/components/views/memory-view";
import { DocsView } from "@/components/views/docs-view";
import { OfficeView } from "@/components/views/office-view";
import { supabase, type Agent } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings, Activity, Cpu, HardDrive, Wifi } from "lucide-react";
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
      <div className="flex h-full items-center justify-center">
        <span className="text-sm text-[#555]">Loading...</span>
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
  const [activeView, setActiveView] = useState<ViewId>("tasks");
  const ViewComponent = viewComponents[activeView];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0b]">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar activeView={activeView} />
        <main className="flex-1 overflow-hidden">
          <ViewComponent />
        </main>
      </div>
    </div>
  );
}
