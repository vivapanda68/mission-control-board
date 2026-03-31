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

// Desktop sidebar (unchanged)
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

// Mobile bottom tab bar
export function MobileNav({ activeView, onViewChange }: SidebarProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-[#252529] bg-[#0a0a0b]/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)] md:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 pt-2 pb-1.5 transition-colors",
              isActive
                ? "text-indigo-400"
                : "text-[#666] active:text-[#999]"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
