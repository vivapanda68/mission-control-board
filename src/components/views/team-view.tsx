"use client";

import { useState, useEffect } from "react";
import { supabase, type Agent } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  working: { label: "Working", color: "#10b981", bg: "#10b98118" },
  idle: { label: "Idle", color: "#f59e0b", bg: "#f59e0b18" },
  paused: { label: "Paused", color: "#6366f1", bg: "#6366f118" },
  offline: { label: "Offline", color: "#555", bg: "#55555518" },
};

export function TeamView() {
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Agent Team</h2>
            <p className="mt-0.5 text-xs text-[#555]">
              {agents.filter((a) => a.status === "working").length} active ·{" "}
              {agents.length} total
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => {
            const status = statusConfig[agent.status] ?? statusConfig.offline;
            return (
              <div
                key={agent.id}
                className="group rounded-xl border border-[#1e1e22] bg-[#111113] p-5 transition-colors hover:border-[#2a2a2e]"
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
    </ScrollArea>
  );
}
