"use client";

import { useState, useEffect, useCallback } from "react";
import { Command } from "cmdk";
import {
  CheckSquare,
  Users,
  Calendar,
  FolderKanban,
  Brain,
  FileText,
  Building2,
  Settings,
  UserCircle,
  LayoutDashboard,
  Plus,
  Search,
} from "lucide-react";
import { supabase, type Task, type Agent, type Project, type Document } from "@/lib/supabase";
import type { ViewId } from "@/components/sidebar";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewChange: (view: ViewId) => void;
}

const viewItems: { id: ViewId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "team", label: "Team", icon: Users },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "memory", label: "Memory", icon: Brain },
  { id: "docs", label: "Documents", icon: FileText },
  { id: "office", label: "Office", icon: Building2 },
  { id: "agents", label: "Agents", icon: UserCircle },
  { id: "system", label: "System", icon: Settings },
];

export function CommandPalette({ open, onOpenChange, onViewChange }: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);

  const fetchSearchData = useCallback(async () => {
    const [tasksRes, agentsRes, projectsRes, docsRes] = await Promise.all([
      supabase.from("tasks").select("id, title, status").order("created_at", { ascending: false }).limit(50),
      supabase.from("agents").select("id, name, role, color, status").order("name").limit(20),
      supabase.from("projects").select("id, name, status").order("name").limit(20),
      supabase.from("documents").select("id, title, doc_type").order("updated_at", { ascending: false }).limit(20),
    ]);
    if (tasksRes.data) setTasks(tasksRes.data as Task[]);
    if (agentsRes.data) setAgents(agentsRes.data as Agent[]);
    if (projectsRes.data) setProjects(projectsRes.data as Project[]);
    if (docsRes.data) setDocs(docsRes.data as Document[]);
  }, []);

  useEffect(() => {
    if (open) {
      setSearch("");
      fetchSearchData();
    }
  }, [open, fetchSearchData]);

  function selectView(view: ViewId) {
    onViewChange(view);
    onOpenChange(false);
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Command palette"
      className="fixed inset-0 z-50"
    >
      <div
        className="fixed inset-0 bg-black/60"
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-xl border border-[#1e1e22] bg-[#111113] shadow-2xl">
        <div className="flex items-center gap-2 border-b border-[#1e1e22] px-4">
          <Search className="h-4 w-4 text-[#555]" />
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Search tasks, agents, projects, docs..."
            className="h-11 flex-1 bg-transparent text-sm text-[#e0e0e0] placeholder:text-[#444] outline-none"
          />
          <kbd className="rounded border border-[#1e1e22] bg-[#0a0a0b] px-1.5 py-0.5 text-[10px] text-[#555]">
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-80 overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-xs text-[#555]">
            No results found.
          </Command.Empty>

          {/* Quick actions */}
          <Command.Group
            heading={
              <span className="px-2 text-[10px] font-medium uppercase tracking-wider text-[#555]">
                Quick Actions
              </span>
            }
          >
            <Command.Item
              value="Create new task"
              onSelect={() => selectView("tasks")}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-xs text-[#999] aria-selected:bg-[#1e1e22] aria-selected:text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              Create new task
            </Command.Item>
          </Command.Group>

          {/* Navigate to views */}
          <Command.Group
            heading={
              <span className="px-2 text-[10px] font-medium uppercase tracking-wider text-[#555]">
                Navigation
              </span>
            }
          >
            {viewItems.map((item) => {
              const Icon = item.icon;
              return (
                <Command.Item
                  key={item.id}
                  value={`Go to ${item.label}`}
                  onSelect={() => selectView(item.id)}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-xs text-[#999] aria-selected:bg-[#1e1e22] aria-selected:text-white"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Command.Item>
              );
            })}
          </Command.Group>

          {/* Tasks */}
          {tasks.length > 0 && (
            <Command.Group
              heading={
                <span className="px-2 text-[10px] font-medium uppercase tracking-wider text-[#555]">
                  Tasks
                </span>
              }
            >
              {tasks.map((task) => (
                <Command.Item
                  key={task.id}
                  value={`Task: ${task.title}`}
                  onSelect={() => selectView("tasks")}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-xs text-[#999] aria-selected:bg-[#1e1e22] aria-selected:text-white"
                >
                  <CheckSquare className="h-3.5 w-3.5" />
                  <span className="flex-1 truncate">{task.title}</span>
                  <span className="text-[10px] capitalize text-[#555]">
                    {task.status?.replace("_", " ")}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {/* Agents */}
          {agents.length > 0 && (
            <Command.Group
              heading={
                <span className="px-2 text-[10px] font-medium uppercase tracking-wider text-[#555]">
                  Agents
                </span>
              }
            >
              {agents.map((agent) => (
                <Command.Item
                  key={agent.id}
                  value={`Agent: ${agent.name} ${agent.role}`}
                  onSelect={() => selectView("agents")}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-xs text-[#999] aria-selected:bg-[#1e1e22] aria-selected:text-white"
                >
                  <div
                    className="flex h-4 w-4 items-center justify-center rounded text-[7px] font-bold text-white"
                    style={{ backgroundColor: agent.color }}
                  >
                    {agent.name[0]}
                  </div>
                  <span className="flex-1 truncate">{agent.name}</span>
                  <span className="text-[10px] capitalize text-[#555]">
                    {agent.status}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <Command.Group
              heading={
                <span className="px-2 text-[10px] font-medium uppercase tracking-wider text-[#555]">
                  Projects
                </span>
              }
            >
              {projects.map((project) => (
                <Command.Item
                  key={project.id}
                  value={`Project: ${project.name}`}
                  onSelect={() => selectView("projects")}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-xs text-[#999] aria-selected:bg-[#1e1e22] aria-selected:text-white"
                >
                  <FolderKanban className="h-3.5 w-3.5" />
                  <span className="flex-1 truncate">{project.name}</span>
                  <span className="text-[10px] capitalize text-[#555]">
                    {project.status}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {/* Docs */}
          {docs.length > 0 && (
            <Command.Group
              heading={
                <span className="px-2 text-[10px] font-medium uppercase tracking-wider text-[#555]">
                  Documents
                </span>
              }
            >
              {docs.map((doc) => (
                <Command.Item
                  key={doc.id}
                  value={`Document: ${doc.title}`}
                  onSelect={() => selectView("docs")}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-xs text-[#999] aria-selected:bg-[#1e1e22] aria-selected:text-white"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span className="flex-1 truncate">{doc.title}</span>
                  <span className="text-[10px] text-[#555]">{doc.doc_type}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>
      </div>
    </Command.Dialog>
  );
}
