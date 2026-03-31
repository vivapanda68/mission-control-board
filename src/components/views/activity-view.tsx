"use client";

import { useState, useEffect, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase, type Activity, type Agent, type Project } from "@/lib/supabase";
import { formatRelativeTime } from "@/lib/format";
import { Filter } from "lucide-react";

function groupByDate(activities: Activity[]): Map<string, Activity[]> {
  const groups = new Map<string, Activity[]>();
  for (const activity of activities) {
    const date = new Date(activity.created_at);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let key: string;
    if (date.toDateString() === today.toDateString()) {
      key = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      key = "Yesterday";
    } else {
      key = date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }

    const existing = groups.get(key) ?? [];
    groups.set(key, [...existing, activity]);
  }
  return groups;
}

export function ActivityView() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAgent, setFilterAgent] = useState<string>("all");
  const [filterProject, setFilterProject] = useState<string>("all");
  const [limit, setLimit] = useState(50);
  const [hasMore, setHasMore] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchData = useCallback(async () => {
    const [activitiesRes, agentsRes, projectsRes] = await Promise.all([
      supabase
        .from("activities")
        .select("*, agents(*)")
        .order("created_at", { ascending: false })
        .limit(limit),
      supabase.from("agents").select("*").order("name"),
      supabase.from("projects").select("*").order("name"),
    ]);
    if (activitiesRes.data) {
      setActivities(activitiesRes.data);
      setHasMore(activitiesRes.data.length === limit);
    }
    if (agentsRes.data) setAgents(agentsRes.data);
    if (projectsRes.data) setProjects(projectsRes.data);
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Apply filters
  const filtered = activities.filter((a) => {
    if (filterAgent !== "all" && a.agent_id !== filterAgent) return false;
    if (filterProject !== "all") {
      const meta = a.metadata as Record<string, unknown>;
      if (meta?.project_id !== filterProject) return false;
    }
    return true;
  });

  const grouped = groupByDate(filtered);
  const hasActiveFilters = filterAgent !== "all" || filterProject !== "all";

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="mb-6">
          <div className="mb-2 h-4 w-32 animate-pulse rounded bg-[#252529]" />
          <div className="h-3 w-48 animate-pulse rounded bg-[#252529]" />
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-7 w-7 animate-pulse rounded-full bg-[#252529]" />
              <div className="flex-1">
                <div className="mb-1 h-3 w-3/4 animate-pulse rounded bg-[#252529]" />
                <div className="h-2 w-20 animate-pulse rounded bg-[#252529]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 md:p-6">
        {/* Header + Filters */}
        <div className="mb-5 md:mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white md:text-sm">Activity Log</h2>
              <p className="mt-0.5 text-sm text-[#888] md:text-xs">
                {filtered.length} activities
              </p>
            </div>
            {/* Desktop filters */}
            <div className="hidden items-center gap-3 md:flex">
              <Select value={filterAgent} onValueChange={setFilterAgent}>
                <SelectTrigger className="w-[140px] border-[#252529] bg-[#131316] text-xs text-[#f0f0f0] focus:ring-1 focus:ring-[#444]">
                  <SelectValue placeholder="All agents" />
                </SelectTrigger>
                <SelectContent className="border-[#252529] bg-[#131316]">
                  <SelectItem value="all" className="text-xs text-[#b0b0b0] focus:bg-[#252529] focus:text-white">
                    All agents
                  </SelectItem>
                  {agents.map((agent) => (
                    <SelectItem
                      key={agent.id}
                      value={agent.id}
                      className="text-xs text-[#f0f0f0] focus:bg-[#252529] focus:text-white"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: agent.color }}
                        />
                        {agent.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterProject} onValueChange={setFilterProject}>
                <SelectTrigger className="w-[140px] border-[#252529] bg-[#131316] text-xs text-[#f0f0f0] focus:ring-1 focus:ring-[#444]">
                  <SelectValue placeholder="All projects" />
                </SelectTrigger>
                <SelectContent className="border-[#252529] bg-[#131316]">
                  <SelectItem value="all" className="text-xs text-[#b0b0b0] focus:bg-[#252529] focus:text-white">
                    All projects
                  </SelectItem>
                  {projects.map((project) => (
                    <SelectItem
                      key={project.id}
                      value={project.id}
                      className="text-xs text-[#f0f0f0] focus:bg-[#252529] focus:text-white"
                    >
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Mobile filter toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`h-9 gap-1.5 text-sm md:hidden ${hasActiveFilters ? "text-indigo-400" : "text-[#888]"}`}
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>

          {/* Mobile filters (collapsible) */}
          {filtersOpen && (
            <div className="mt-3 flex flex-col gap-2.5 rounded-lg border border-[#252529] bg-[#131316] p-3 md:hidden">
              <Select value={filterAgent} onValueChange={setFilterAgent}>
                <SelectTrigger className="h-10 border-[#252529] bg-[#0a0a0b] text-sm text-[#f0f0f0] focus:ring-1 focus:ring-[#444]">
                  <SelectValue placeholder="All agents" />
                </SelectTrigger>
                <SelectContent className="border-[#252529] bg-[#131316]">
                  <SelectItem value="all" className="text-sm text-[#b0b0b0] focus:bg-[#252529] focus:text-white">
                    All agents
                  </SelectItem>
                  {agents.map((agent) => (
                    <SelectItem
                      key={agent.id}
                      value={agent.id}
                      className="text-sm text-[#f0f0f0] focus:bg-[#252529] focus:text-white"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: agent.color }}
                        />
                        {agent.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterProject} onValueChange={setFilterProject}>
                <SelectTrigger className="h-10 border-[#252529] bg-[#0a0a0b] text-sm text-[#f0f0f0] focus:ring-1 focus:ring-[#444]">
                  <SelectValue placeholder="All projects" />
                </SelectTrigger>
                <SelectContent className="border-[#252529] bg-[#131316]">
                  <SelectItem value="all" className="text-sm text-[#b0b0b0] focus:bg-[#252529] focus:text-white">
                    All projects
                  </SelectItem>
                  {projects.map((project) => (
                    <SelectItem
                      key={project.id}
                      value={project.id}
                      className="text-sm text-[#f0f0f0] focus:bg-[#252529] focus:text-white"
                    >
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterAgent("all");
                    setFilterProject("all");
                  }}
                  className="h-9 text-sm text-[#888] hover:text-white"
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Timeline grouped by date */}
        <div className="flex flex-col gap-5 md:gap-6">
          {Array.from(grouped.entries()).map(([date, dateActivities]) => (
            <div key={date}>
              <div className="mb-2.5 flex items-center gap-3 md:mb-3">
                <span className="text-sm font-medium text-[#b0b0b0] md:text-xs">{date}</span>
                <div className="h-px flex-1 bg-[#252529]" />
              </div>
              <div className="flex flex-col gap-0.5">
                {dateActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="group flex gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-[#131316] md:py-2.5"
                  >
                    <div
                      className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white md:h-7 md:w-7 md:text-[11px]"
                      style={{
                        backgroundColor: activity.agents?.color ?? "#777",
                      }}
                    >
                      {(activity.agents?.name ?? "?")[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-relaxed text-[#a0a0a0] md:text-xs">
                        <span
                          className="font-medium"
                          style={{
                            color: activity.agents?.color ?? "#777",
                          }}
                        >
                          {activity.agents?.name ?? "System"}
                        </span>{" "}
                        {activity.action}{" "}
                        <span className="text-[#ddd]">
                          {activity.description}
                        </span>
                      </p>
                      <span className="text-xs text-[#666] md:text-[11px]">
                        {formatRelativeTime(activity.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <span className="text-sm text-[#777] md:text-xs">No activities found</span>
          )}
        </div>

        {/* Load more */}
        {hasMore && filtered.length > 0 && (
          <div className="mt-6 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLimit((prev) => prev + 50)}
              className="h-10 px-6 text-sm text-[#b0b0b0] hover:bg-[#252529] hover:text-white md:h-8 md:px-4 md:text-xs"
            >
              Load more
            </Button>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
