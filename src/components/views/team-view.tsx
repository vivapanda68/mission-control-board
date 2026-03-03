"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, type Agent } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import { AgentDialog } from "@/components/agent-dialog";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  working: { label: "Working", color: "#10b981", bg: "#10b98118" },
  idle: { label: "Idle", color: "#f59e0b", bg: "#f59e0b18" },
  paused: { label: "Paused", color: "#6366f1", bg: "#6366f118" },
  offline: { label: "Offline", color: "#555", bg: "#55555518" },
};

export function TeamView() {
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

  function handleCreateClick() {
    setEditingAgent(null);
    setDialogOpen(true);
  }

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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl border border-[#1e1e22] bg-[#111113]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Agent Team</h2>
            <p className="mt-0.5 text-xs text-[#555]">
              {agents.filter((a) => a.status === "working").length} active ·{" "}
              {agents.length} total
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleCreateClick}
            className="gap-1.5 bg-indigo-600 text-xs text-white hover:bg-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" />
            New Agent
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => {
            const status = statusConfig[agent.status] ?? statusConfig.offline;
            return (
              <div
                key={agent.id}
                className="group cursor-pointer rounded-xl border border-[#1e1e22] bg-[#111113] p-5 transition-colors hover:border-[#2a2a2e]"
                onClick={() => handleEditClick(agent)}
              >
                {/* Header */}
                <div className="mb-4 flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: agent.color }}
                  >
                    {agent.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">
                        {agent.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className="border-transparent px-1.5 py-0 text-[10px]"
                        style={{
                          backgroundColor: status.bg,
                          color: status.color,
                        }}
                      >
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#666]">{agent.role}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="mb-4 text-xs leading-relaxed text-[#888]">
                  {agent.description}
                </p>

                {/* Current task */}
                {agent.current_task && (
                  <div className="mb-4 rounded-lg border border-[#1e1e22] bg-[#0a0a0b] px-3 py-2">
                    <span className="text-[10px] text-[#555]">
                      Current Task
                    </span>
                    <p className="text-xs text-[#ccc]">{agent.current_task}</p>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {agent.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="border-[#1e1e22] bg-[#0a0a0b] px-2 py-0 text-[10px] text-[#666]"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
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
