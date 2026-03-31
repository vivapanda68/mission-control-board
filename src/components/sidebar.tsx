"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  KanbanSquare,
  FolderKanban,
  ScrollText,
  Timer,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type ViewId = "dashboard" | "backlog" | "projects" | "activity" | "crons";

interface SidebarProps {
  activeView: ViewId;
  onViewChange: (view: ViewId) => void;
}

const navItems: { id: ViewId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "backlog", label: "Backlog", icon: KanbanSquare },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "activity", label: "Activity", icon: ScrollText },
  { id: "crons", label: "Cron Jobs", icon: Timer },
];

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <aside className="flex h-full w-[52px] flex-col items-center border-r border-[#252529] bg-[#0a0a0b] py-3">
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
                        ? "bg-[#252529] text-white"
                        : "text-[#777] hover:bg-[#1a1a1e] hover:text-[#a0a0a0]"
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
      </aside>
    </TooltipProvider>
  );
}
