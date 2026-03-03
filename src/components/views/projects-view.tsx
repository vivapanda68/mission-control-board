"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, type Project } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import { ProjectDialog } from "@/components/project-dialog";

const statusStyles: Record<string, { color: string; bg: string }> = {
  active: { color: "#10b981", bg: "#10b98118" },
  paused: { color: "#f59e0b", bg: "#f59e0b18" },
  completed: { color: "#6366f1", bg: "#6366f118" },
  planning: { color: "#8b5cf6", bg: "#8b5cf618" },
};

const priorityStyles: Record<string, { color: string; label: string }> = {
  low: { color: "#555", label: "Low" },
  medium: { color: "#6366f1", label: "Medium" },
  high: { color: "#f59e0b", label: "High" },
};

export function ProjectsView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

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

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="mb-2 h-4 w-32 animate-pulse rounded bg-[#1e1e22]" />
          <div className="h-3 w-48 animate-pulse rounded bg-[#1e1e22]" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl border border-[#1e1e22] bg-[#111113]" />
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
            <h2 className="text-sm font-semibold text-white">Projects</h2>
            <p className="mt-0.5 text-xs text-[#555]">
              {projects.filter((p) => p.status === "active").length} active ·{" "}
              {projects.length} total
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleCreateClick}
            className="gap-1.5 bg-indigo-600 text-xs text-white hover:bg-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" />
            New Project
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const status = statusStyles[project.status] ?? statusStyles.active;
            const priority = priorityStyles[project.priority] ?? priorityStyles.medium;
            return (
              <div
                key={project.id}
                className="group cursor-pointer rounded-xl border border-[#1e1e22] bg-[#111113] p-5 transition-colors hover:border-[#2a2a2e]"
                onClick={() => handleEditClick(project)}
              >
                {/* Header */}
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">
                        {project.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-transparent px-1.5 py-0 text-[10px] capitalize"
                        style={{
                          backgroundColor: status.bg,
                          color: status.color,
                        }}
                      >
                        {project.status.replace("_", " ")}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-transparent px-1.5 py-0 text-[10px]"
                        style={{
                          backgroundColor: `${priority.color}18`,
                          color: priority.color,
                        }}
                      >
                        {priority.label}
                      </Badge>
                    </div>
                  </div>
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: project.agents?.color ?? "#666" }}
                  >
                    {(project.agents?.name ?? "?").substring(0, 2).toUpperCase()}
                  </div>
                </div>

                {/* Description */}
                <p className="mb-4 text-xs leading-relaxed text-[#888]">
                  {project.description}
                </p>

                {/* Progress */}
                <div className="mb-4">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[10px] text-[#555]">Progress</span>
                    <span className="text-[10px] font-medium text-[#999]">
                      {project.progress_percent}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1e1e22]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${project.progress_percent}%`,
                        backgroundColor: project.agents?.color ?? "#666",
                      }}
                    />
                  </div>
                  <div className="mt-1 text-[10px] text-[#555]">
                    {project.completed_tasks} / {project.total_tasks} tasks
                  </div>
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
