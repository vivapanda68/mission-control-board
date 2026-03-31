"use client";

import { Bell, Pause, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ViewId } from "@/components/sidebar";

const viewTitles: Record<ViewId, string> = {
  dashboard: "Dashboard",
  backlog: "Backlog",
  projects: "Projects",
  activity: "Activity",
};

interface TopbarProps {
  activeView: ViewId;
}

export function Topbar({ activeView }: TopbarProps) {
  return (
    <header className="flex h-12 items-center justify-between border-b border-[#252529] bg-[#0a0a0b] px-4">
      {/* Left: Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-white">
          {viewTitles[activeView]}
        </h1>
        <Badge
          variant="outline"
          className="border-[#252529] bg-[#131316] text-[11px] text-[#777]"
        >
          Mission Control
        </Badge>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-[#777] hover:bg-[#252529] hover:text-white"
        >
          <Bell className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400"
        >
          <Pause className="h-3.5 w-3.5" />
          <span className="text-xs">Pause All</span>
        </Button>

        <div className="mx-1 h-4 w-px bg-[#252529]" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-[#b0b0b0] hover:bg-[#252529] hover:text-white"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                <span className="text-[11px] font-bold text-white">N</span>
              </div>
              <span className="text-xs">Nam</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="border-[#252529] bg-[#131316]"
          >
            <DropdownMenuItem className="text-xs text-[#b0b0b0]">
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs text-[#b0b0b0]">
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#252529]" />
            <DropdownMenuItem className="text-xs text-red-400">
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
