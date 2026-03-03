"use client";

import { useState, useEffect, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase, type Schedule } from "@/lib/supabase";
import { Radio, Plus } from "lucide-react";
import { ScheduleDialog } from "@/components/schedule-dialog";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = Array.from({ length: 10 }, (_, i) => i + 8); // 8AM - 5PM

interface ScheduleBlock {
  id: string;
  scheduleId: string;
  agent: string;
  agentColor: string;
  task: string;
  day: number;
  startHour: number;
  duration: number;
}

export function CalendarView() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  const fetchData = useCallback(async () => {
    const { data } = await supabase
      .from("schedules")
      .select("*, agents(*)")
      .order("time_slot");
    if (data) setSchedules(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleCreateClick() {
    setEditingSchedule(null);
    setDialogOpen(true);
  }

  function handleEditSchedule(scheduleId: string) {
    const schedule = schedules.find((s) => s.id === scheduleId);
    if (schedule) {
      setEditingSchedule(schedule);
      setDialogOpen(true);
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm text-[#555]">Loading...</span>
      </div>
    );
  }

  // Convert schedules to blocks for the grid
  const scheduleBlocks: ScheduleBlock[] = schedules
    .filter((s) => !s.is_always_running)
    .flatMap((schedule) =>
      schedule.days_of_week.map((day) => ({
        id: `${schedule.id}-${day}`,
        scheduleId: schedule.id,
        agent: schedule.agents?.name ?? "Unknown",
        agentColor: schedule.agents?.color ?? "#666",
        task: schedule.task_name,
        day,
        startHour: parseInt(schedule.time_slot.split(":")[0], 10),
        duration: schedule.duration_minutes / 60,
      }))
    );

  const alwaysRunning = schedules
    .filter((s) => s.is_always_running)
    .map((s) => ({
      id: s.id,
      agent: s.agents?.name ?? "Unknown",
      agentColor: s.agents?.color ?? "#666",
      task: s.task_name,
    }));

  return (
    <div className="flex h-full flex-col">
      {/* Always Running section */}
      <div className="flex items-center gap-3 border-b border-[#1e1e22] px-6 py-3">
        <div className="flex items-center gap-2">
          <Radio className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-xs font-medium text-[#999]">
            Always Running
          </span>
        </div>
        <div className="flex gap-2">
          {alwaysRunning.map((item) => (
            <Badge
              key={item.task}
              variant="outline"
              className="cursor-pointer gap-1.5 border-[#1e1e22] bg-[#111113] py-0.5 text-[11px] hover:border-[#2a2a2e]"
              onClick={() => handleEditSchedule(item.id)}
            >
              <div
                className="h-1.5 w-1.5 animate-pulse rounded-full"
                style={{ backgroundColor: item.agentColor }}
              />
              <span style={{ color: item.agentColor }}>{item.agent}</span>
              <span className="text-[#666]">&middot;</span>
              <span className="text-[#888]">{item.task}</span>
            </Badge>
          ))}
        </div>
        <div className="ml-auto">
          <Button
            size="sm"
            onClick={handleCreateClick}
            className="gap-1.5 bg-indigo-600 text-xs text-white hover:bg-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" />
            New Schedule
          </Button>
        </div>
      </div>

      {/* Schedule grid */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          <div className="overflow-hidden rounded-lg border border-[#1e1e22]">
            {/* Day headers */}
            <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-[#1e1e22]">
              <div className="bg-[#111113] p-2" />
              {days.map((day, i) => (
                <div
                  key={day}
                  className="border-l border-[#1e1e22] bg-[#111113] p-2 text-center"
                >
                  <span className="text-xs font-medium text-[#888]">
                    {day}
                  </span>
                  <div className="mt-0.5 text-[10px] text-[#444]">
                    Mar {3 + i}
                  </div>
                </div>
              ))}
            </div>

            {/* Time rows */}
            {hours.map((hour) => (
              <div
                key={hour}
                className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-[#1e1e22] last:border-b-0"
              >
                {/* Hour label */}
                <div className="flex items-start justify-end bg-[#0a0a0b] p-2 pr-3">
                  <span className="text-[10px] text-[#444]">
                    {hour > 12
                      ? `${hour - 12} PM`
                      : hour === 12
                        ? "12 PM"
                        : `${hour} AM`}
                  </span>
                </div>
                {/* Day cells */}
                {days.map((_, dayIndex) => {
                  const blocksInCell = scheduleBlocks.filter(
                    (b) => b.day === dayIndex && b.startHour === hour
                  );
                  return (
                    <div
                      key={dayIndex}
                      className="relative min-h-[48px] border-l border-[#1e1e22] p-0.5"
                    >
                      {blocksInCell.map((block) => (
                        <div
                          key={block.id}
                          className="cursor-pointer rounded-md px-2 py-1.5 transition-opacity hover:opacity-80"
                          style={{
                            backgroundColor: `${block.agentColor}15`,
                            borderLeft: `2px solid ${block.agentColor}`,
                            minHeight: `${block.duration * 48 - 4}px`,
                          }}
                          onClick={() => handleEditSchedule(block.scheduleId)}
                        >
                          <div
                            className="text-[10px] font-medium"
                            style={{ color: block.agentColor }}
                          >
                            {block.agent}
                          </div>
                          <div className="text-[10px] text-[#888]">
                            {block.task}
                          </div>
                          {block.duration > 1 && (
                            <div className="mt-0.5 text-[9px] text-[#555]">
                              {block.duration}h
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>

      <ScheduleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        schedule={editingSchedule}
        onSaved={fetchData}
      />
    </div>
  );
}
