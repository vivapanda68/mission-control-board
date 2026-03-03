"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Calendar,
  FolderKanban,
  Brain,
  FileText,
  UserCircle,
  Building2,
  Settings,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type ViewId =
  | "dashboard"
  | "tasks"
  | "agents"
  | "calendar"
  | "projects"
  | "memory"
  | "docs"
  | "team"
  | "office"
  | "system";

interface SidebarProps {
  activeView: ViewId;
  onViewChange: (view: ViewId) => void;
}

const navItems: { id: ViewId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "team", label: "Team", icon: Users },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "memory", label: "Memory", icon: Brain },
  { id: "docs", label: "Docs", icon: FileText },
  { id: "office", label: "Office", icon: Building2 },
];

const bottomItems: { id: ViewId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "agents", label: "Agents", icon: UserCircle },
  { id: "system", label: "System", icon: Settings },
];

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <aside className="flex h-full w-[52px] flex-col items-center border-r border-[#1e1e22] bg-[#0a0a0b] py-3">
        {/* Logo */}
        <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
          <span className="text-xs font-bold text-white">MC</span>
        </div>

        {/* Main nav */}
        <nav className="flex flex-1 flex-col items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onViewChange(item.id)}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                      isActive
                        ? "bg-[#1e1e22] text-white"
                        : "text-[#555] hover:bg-[#151517] hover:text-[#888]"
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* Bottom nav */}
        <div className="flex flex-col items-center gap-1">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onViewChange(item.id)}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                      isActive
                        ? "bg-[#1e1e22] text-white"
                        : "text-[#555] hover:bg-[#151517] hover:text-[#888]"
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </aside>
    </TooltipProvider>
  );
}
