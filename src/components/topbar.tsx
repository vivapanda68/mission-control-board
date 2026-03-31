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
  crons: "Cron Jobs",
};

interface TopbarProps {
  activeView: ViewId;
}

export function Topbar({ activeView }: TopbarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-[#252529] bg-[#0a0a0b] px-3 md:px-4">
      {/* Left: Logo (mobile only) + Title */}
      <div className="flex items-center gap-2.5">
        {/* MC logo on mobile since sidebar is hidden */}
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 md:hidden">
          <span className="text-[10px] font-bold text-white">MC</span>
        </div>
        <h1 className="text-sm font-semibold text-white md:text-sm">
          {viewTitles[activeView]}
        </h1>
        <Badge
          variant="outline"
          className="hidden border-[#252529] bg-[#131316] text-[11px] text-[#777] sm:inline-flex"
        >
          Mission Control
        </Badge>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 md:gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-9 w-9 text-[#777] hover:bg-[#252529] hover:text-white md:h-8 md:w-8"
        >
          <Bell className="h-4 w-4 md:h-3.5 md:w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="hidden gap-1.5 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400 sm:inline-flex"
        >
          <Pause className="h-3.5 w-3.5" />
          <span className="text-xs">Pause All</span>
        </Button>

        <div className="mx-0.5 hidden h-4 w-px bg-[#252529] sm:block md:mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5 px-2 text-[#b0b0b0] hover:bg-[#252529] hover:text-white md:h-8 md:gap-2 md:px-3"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 md:h-5 md:w-5">
                <span className="text-[11px] font-bold text-white md:text-[11px]">N</span>
              </div>
              <span className="hidden text-xs sm:inline">Nam</span>
              <ChevronDown className="hidden h-3 w-3 sm:block" />
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
