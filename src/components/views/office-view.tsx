"use client";

import { useState, useEffect } from "react";
import { supabase, type Agent } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, Volume2 } from "lucide-react";

function PixelCharacter({
  color,
  initials,
  isActive,
  isAnimating,
}: {
  color: string;
  initials: string;
  isActive: boolean;
  isAnimating: boolean;
}) {
  return (
    <div className="relative flex flex-col items-center">
      {/* Status indicator */}
      {isActive && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className="flex gap-0.5">
            <div
              className="h-1 w-1 animate-bounce rounded-full"
              style={{
                backgroundColor: color,
                animationDelay: "0ms",
                animationDuration: "1s",
              }}
            />
            <div
              className="h-1 w-1 animate-bounce rounded-full"
              style={{
                backgroundColor: color,
                animationDelay: "200ms",
                animationDuration: "1s",
              }}
            />
            <div
              className="h-1 w-1 animate-bounce rounded-full"
              style={{
                backgroundColor: color,
                animationDelay: "400ms",
                animationDuration: "1s",
              }}
            />
          </div>
        </div>
      )}

      {/* Head */}
      <div
        className="h-5 w-5 rounded-sm flex items-center justify-center text-[7px] font-bold text-white"
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>
      {/* Body */}
      <div
        className="mt-px h-4 w-4 rounded-b-sm"
        style={{ backgroundColor: `${color}cc` }}
      />
      {/* Arms - animated when active */}
      <div className="absolute top-5 flex w-8 justify-between">
        <div
          className={`h-3 w-1 rounded-sm ${isAnimating ? "animate-pulse" : ""}`}
          style={{ backgroundColor: `${color}99` }}
        />
        <div
          className={`h-3 w-1 rounded-sm ${isAnimating ? "animate-pulse" : ""}`}
          style={{
            backgroundColor: `${color}99`,
            animationDelay: "500ms",
          }}
        />
      </div>
    </div>
  );
}

function Desk({
  agent,
  isAnimating,
}: {
  agent: Agent;
  isAnimating: boolean;
}) {
  const initials = agent.name.substring(0, 2).toUpperCase();
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Agent label */}
      <div className="text-[10px] font-medium" style={{ color: agent.color }}>
        {agent.name}
      </div>

      {/* Character */}
      <PixelCharacter
        color={agent.color}
        initials={initials}
        isActive={agent.status === "working"}
        isAnimating={isAnimating && agent.status === "working"}
      />

      {/* Desk surface */}
      <div className="relative">
        <div className="h-3 w-20 rounded-t-sm bg-[#2a2520]" />
        <div className="h-8 w-20 rounded-b-sm bg-[#1e1a15] flex items-center justify-center gap-1">
          {/* Monitor */}
          <div className="h-5 w-7 rounded-sm border border-[#333] bg-[#111]">
            <div
              className="m-0.5 h-3 rounded-[1px]"
              style={{
                backgroundColor:
                  agent.status === "working" ? `${agent.color}33` : "#111",
              }}
            >
              {agent.status === "working" && (
                <div className="flex flex-col gap-0.5 p-0.5">
                  <div
                    className="h-[1px] w-3 rounded-full"
                    style={{ backgroundColor: `${agent.color}66` }}
                  />
                  <div
                    className="h-[1px] w-2 rounded-full"
                    style={{ backgroundColor: `${agent.color}44` }}
                  />
                  <div
                    className="h-[1px] w-4 rounded-full"
                    style={{ backgroundColor: `${agent.color}44` }}
                  />
                </div>
              )}
            </div>
          </div>
          {/* Keyboard */}
          <div className="h-2 w-6 rounded-[1px] bg-[#222]">
            <div className="grid grid-cols-5 gap-[1px] p-[1px]">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-[1px] w-[1px] bg-[#333]" />
              ))}
            </div>
          </div>
        </div>
        {/* Desk legs */}
        <div className="flex justify-between px-1">
          <div className="h-4 w-1 bg-[#1a1610]" />
          <div className="h-4 w-1 bg-[#1a1610]" />
        </div>
      </div>

      {/* Task badge */}
      {agent.current_task && (
        <Badge
          variant="outline"
          className="max-w-[100px] truncate border-[#1e1e22] bg-[#111113] px-1.5 py-0 text-[8px] text-[#666]"
        >
          {agent.current_task}
        </Badge>
      )}
    </div>
  );
}

export function OfficeView() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);

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
        <div className="h-64 w-96 animate-pulse rounded-xl border border-[#1e1e22] bg-[#111113]" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Office floor */}
      <div className="flex flex-1 items-center justify-center">
        <div className="relative">
          {/* Floor background */}
          <div className="rounded-xl border border-[#1e1e22] bg-[#0d0d0f] p-12">
            {/* Room label */}
            <div className="mb-8 text-center">
              <span className="text-xs font-medium text-[#333]">
                ▸ MISSION CONTROL — FLOOR 1 ◂
              </span>
            </div>

            {/* Desk grid */}
            <div className="grid grid-cols-4 gap-x-12 gap-y-10">
              {agents.map((agent) => (
                <Desk key={agent.id} agent={agent} isAnimating={isPlaying} />
              ))}
            </div>

            {/* Floor decorations */}
            <div className="mt-8 flex items-center justify-center gap-8">
              {/* Water cooler */}
              <div className="flex flex-col items-center gap-0.5">
                <div className="h-4 w-3 rounded-t-sm bg-[#0088cc44]" />
                <div className="h-3 w-4 rounded-b-sm bg-[#222]" />
                <span className="text-[7px] text-[#333]">Water</span>
              </div>
              {/* Plant */}
              <div className="flex flex-col items-center gap-0.5">
                <div className="flex gap-0.5">
                  <div className="h-3 w-2 rounded-full bg-[#10b98144]" />
                  <div className="h-4 w-2 rounded-full bg-[#10b98133]" />
                  <div className="h-3 w-2 rounded-full bg-[#10b98144]" />
                </div>
                <div className="h-2 w-3 rounded-b-sm bg-[#8B6914]" />
                <span className="text-[7px] text-[#333]">Plant</span>
              </div>
              {/* Coffee machine */}
              <div className="flex flex-col items-center gap-0.5">
                <div className="h-5 w-5 rounded-sm bg-[#333]">
                  <div className="m-0.5 h-2 w-2 rounded-full bg-[#ef444444]" />
                </div>
                <span className="text-[7px] text-[#333]">Coffee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo controls bar */}
      <div className="flex items-center justify-center gap-4 border-t border-[#1e1e22] bg-[#0a0a0b] px-6 py-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-[#666] hover:text-white"
          >
            {isPlaying ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSpeed(speed === 1 ? 2 : speed === 2 ? 4 : 1)}
            className="text-[#666] hover:text-white"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </Button>
        </div>
        <span className="text-[10px] text-[#555]">
          {isPlaying ? "Simulation Running" : "Paused"} · {speed}x Speed
        </span>
        <div className="flex items-center gap-3 text-[10px] text-[#444]">
          <span>
            {agents.filter((a) => a.status === "working").length} agents working
          </span>
          <span>·</span>
          <span>
            {agents.filter((a) => a.status === "idle").length} idle
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="ml-auto text-[#666] hover:text-white"
        >
          <Volume2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
