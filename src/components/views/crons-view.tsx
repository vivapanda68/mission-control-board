"use client";

import { useState, useEffect, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase, type CronJob } from "@/lib/supabase";
import { formatRelativeTime } from "@/lib/format";

function formatSchedule(cron: string): string {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return cron;

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const formatTime = (h: string, m: string): string => {
    const hr = parseInt(h, 10);
    const mn = parseInt(m, 10);
    const ampm = hr >= 12 ? "pm" : "am";
    const displayHr = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr;
    return mn === 0 ? `${displayHr}${ampm}` : `${displayHr}:${mn.toString().padStart(2, "0")}${ampm}`;
  };

  // Every minute
  if (minute === "*" && hour === "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    return "Every minute";
  }

  // Every N minutes
  if (minute.startsWith("*/") && hour === "*") {
    return `Every ${minute.slice(2)} minutes`;
  }

  // Every hour at :MM
  if (minute !== "*" && !minute.includes("/") && hour === "*" && dayOfMonth === "*") {
    return `Every hour at :${minute.padStart(2, "0")}`;
  }

  // Every N hours
  if (hour.startsWith("*/") && dayOfMonth === "*") {
    return `Every ${hour.slice(2)} hours`;
  }

  // Specific time patterns
  if (minute !== "*" && !minute.includes("/") && hour !== "*" && !hour.includes("/")) {
    const time = formatTime(hour, minute);

    // Daily
    if (dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
      return `Daily at ${time}`;
    }

    // Specific day of week
    if (dayOfMonth === "*" && month === "*" && dayOfWeek !== "*") {
      if (dayOfWeek === "1-5") return `Weekdays at ${time}`;
      if (dayOfWeek === "0,6") return `Weekends at ${time}`;
      const days = dayOfWeek.split(",").map((d) => dayNames[parseInt(d, 10)] ?? d);
      if (days.length === 1) return `Every ${days[0]} at ${time}`;
      return `${days.join(", ")} at ${time}`;
    }

    // Specific day of month
    if (dayOfMonth !== "*" && dayOfWeek === "*") {
      const monthStr = month !== "*" ? ` in ${monthNames[parseInt(month, 10)] ?? month}` : "";
      return `${dayOfMonth}${ordinalSuffix(parseInt(dayOfMonth, 10))} of month${monthStr} at ${time}`;
    }
  }

  return cron;
}

function ordinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainSec = Math.round(seconds % 60);
  return `${minutes}m ${remainSec}s`;
}

function formatFutureRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = date.getTime() - now.getTime();
  if (diffMs <= 0) return "now";
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "< 1m";
  if (diffMin < 60) return `in ${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `in ${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  return `in ${diffDay}d`;
}

export function CronsView() {
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const { data } = await supabase
      .from("cron_jobs")
      .select("*")
      .order("name");
    if (data) setCronJobs(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const activeCount = cronJobs.filter((j) => j.enabled).length;
  const disabledCount = cronJobs.filter((j) => !j.enabled).length;
  const errorCount = cronJobs.filter((j) => j.enabled && j.last_status === "error").length;

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="mb-6">
          <div className="mb-2 h-4 w-32 animate-pulse rounded bg-[#252529]" />
          <div className="h-3 w-48 animate-pulse rounded bg-[#252529]" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-lg bg-[#111113]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="mb-5 md:mb-6">
          <h2 className="text-base font-semibold text-white md:text-sm">Cron Jobs</h2>
          <p className="mt-0.5 text-sm text-[#888] md:text-xs">
            {cronJobs.length} jobs configured
          </p>
        </div>

        {/* Stats */}
        <div className="mb-5 flex flex-wrap gap-2.5 md:mb-6 md:gap-4">
          <div className="flex min-h-[40px] items-center gap-2 rounded-lg border border-[#1e1e22] bg-[#111113] px-3 py-2 md:min-h-0">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 md:h-2 md:w-2" />
            <span className="text-sm text-[#e0e0e0] md:text-xs">{activeCount} active</span>
          </div>
          <div className="flex min-h-[40px] items-center gap-2 rounded-lg border border-[#1e1e22] bg-[#111113] px-3 py-2 md:min-h-0">
            <div className="h-2.5 w-2.5 rounded-full bg-[#555] md:h-2 md:w-2" />
            <span className="text-sm text-[#e0e0e0] md:text-xs">{disabledCount} disabled</span>
          </div>
          {errorCount > 0 && (
            <div className="flex min-h-[40px] items-center gap-2 rounded-lg border border-[#1e1e22] bg-[#111113] px-3 py-2 md:min-h-0">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500 md:h-2 md:w-2" />
              <span className="text-sm text-[#e0e0e0] md:text-xs">{errorCount} errors</span>
            </div>
          )}
        </div>

        {/* Job Cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cronJobs.map((job) => (
            <div
              key={job.id}
              className="rounded-lg border border-[#1e1e22] bg-[#111113] p-4 transition-colors hover:border-[#2a2a2e]"
            >
              {/* Top row: name + status */}
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2.5 w-2.5 flex-shrink-0 rounded-full md:h-2 md:w-2 ${
                        !job.enabled
                          ? "bg-[#555]"
                          : job.last_status === "error"
                            ? "bg-red-500"
                            : job.last_status === "ok"
                              ? "bg-emerald-500"
                              : "bg-[#555]"
                      }`}
                    />
                    <span className="truncate text-sm font-medium text-[#e0e0e0]">
                      {job.name}
                    </span>
                  </div>
                  {job.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-[#888] md:text-xs">
                      {job.description}
                    </p>
                  )}
                </div>
                <span
                  className={`flex-shrink-0 rounded px-2 py-1 text-[11px] font-medium md:px-1.5 md:py-0.5 md:text-[10px] ${
                    job.enabled
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-[#252529] text-[#666]"
                  }`}
                >
                  {job.enabled ? "enabled" : "disabled"}
                </span>
              </div>

              {/* Schedule */}
              <div className="mb-3 text-sm text-[#b0b0b0] md:text-xs">
                {formatSchedule(job.schedule)}
              </div>

              {/* Model badge */}
              {job.model && (
                <div className="mb-3">
                  <span className="rounded bg-[#252529] px-2 py-0.5 text-[11px] font-medium text-[#a0a0a0] md:px-1.5 md:text-[10px]">
                    {job.model}
                  </span>
                </div>
              )}

              {/* Last run info */}
              <div className="flex flex-col gap-1.5 border-t border-[#1e1e22] pt-2.5 md:gap-1">
                {job.last_run_at ? (
                  <div className="flex items-center justify-between text-xs md:text-[11px]">
                    <span className="text-[#666]">Last run</span>
                    <span className="text-[#a0a0a0]">
                      {formatRelativeTime(job.last_run_at)}
                      {job.last_duration_ms != null && (
                        <span className="text-[#666]"> ({formatDuration(job.last_duration_ms)})</span>
                      )}
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-[#666] md:text-[11px]">Never run</div>
                )}

                {job.next_run_at && job.enabled && (
                  <div className="flex items-center justify-between text-xs md:text-[11px]">
                    <span className="text-[#666]">Next run</span>
                    <span className="text-[#a0a0a0]">
                      {formatFutureRelativeTime(job.next_run_at)}
                    </span>
                  </div>
                )}
              </div>

              {/* Error display */}
              {job.last_status === "error" && job.last_error && (
                <div className="mt-2 rounded bg-red-500/5 px-2.5 py-2 md:px-2 md:py-1.5">
                  <p className="line-clamp-2 text-xs text-red-400 md:text-[11px]">
                    {job.last_error}
                  </p>
                  {job.consecutive_errors > 1 && (
                    <p className="mt-0.5 text-[11px] text-red-400/60 md:text-[10px]">
                      {job.consecutive_errors} consecutive errors
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {cronJobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-[#777] md:text-xs">No cron jobs configured</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
