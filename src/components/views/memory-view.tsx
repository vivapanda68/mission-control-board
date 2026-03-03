"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, type MemoryEntry } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Brain, Lightbulb, GitBranch, Database, Plus } from "lucide-react";
import { MemoryDialog } from "@/components/memory-dialog";

const typeConfig: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; color: string; label: string }
> = {
  journal: { icon: BookOpen, color: "#6366f1", label: "Journal" },
  decision: { icon: GitBranch, color: "#ef4444", label: "Decision" },
  insight: { icon: Lightbulb, color: "#f59e0b", label: "Insight" },
  long_term: { icon: Database, color: "#06b6d4", label: "Long-Term" },
};

function MemoryCard({ entry, onClick }: { entry: MemoryEntry; onClick: () => void }) {
  const config = typeConfig[entry.entry_type] ?? typeConfig.journal;
  const Icon = config.icon;

  return (
    <div
      className="group cursor-pointer rounded-lg border border-[#1e1e22] bg-[#111113] p-4 transition-colors hover:border-[#2a2a2e]"
      onClick={onClick}
    >
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span style={{ color: config.color }}>
            <Icon className="h-3.5 w-3.5" />
          </span>
          <Badge
            variant="outline"
            className="border-transparent px-1.5 py-0 text-[10px]"
            style={{
              backgroundColor: `${config.color}18`,
              color: config.color,
            }}
          >
            {config.label}
          </Badge>
        </div>
      </div>
      <h4 className="mb-1.5 text-[13px] font-medium text-[#e0e0e0]">
        {entry.title}
      </h4>
      <p className="mb-3 whitespace-pre-line text-xs leading-relaxed text-[#888]">
        {entry.content}
      </p>
      <div className="flex flex-wrap gap-1">
        {entry.tags.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="border-[#1e1e22] bg-[#0a0a0b] px-1.5 py-0 text-[10px] text-[#555]"
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date("2026-03-02T00:00:00");
  const yesterday = new Date("2026-03-01T00:00:00");

  if (date.getTime() === today.getTime()) return "Today \u2014 March 2, 2026";
  if (date.getTime() === yesterday.getTime())
    return "Yesterday \u2014 March 1, 2026";
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function MemoryView() {
  const [memoryEntries, setMemoryEntries] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MemoryEntry | null>(null);

  const fetchData = useCallback(async () => {
    const { data } = await supabase
      .from("memory_entries")
      .select("*")
      .order("entry_date", { ascending: false });
    if (data) setMemoryEntries(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleCreateClick() {
    setEditingEntry(null);
    setDialogOpen(true);
  }

  function handleEditClick(entry: MemoryEntry) {
    setEditingEntry(entry);
    setDialogOpen(true);
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="mb-2 h-4 w-32 animate-pulse rounded bg-[#1e1e22]" />
          <div className="h-3 w-48 animate-pulse rounded bg-[#1e1e22]" />
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl border border-[#1e1e22] bg-[#111113]" />
          ))}
        </div>
      </div>
    );
  }

  const dailyEntries = memoryEntries.filter((m) => m.entry_type !== "long_term");
  const longTermEntries = memoryEntries.filter((m) => m.entry_type === "long_term");

  // Group daily entries by date
  const groupedByDate = dailyEntries.reduce(
    (acc, entry) => {
      if (!acc[entry.entry_date]) acc[entry.entry_date] = [];
      acc[entry.entry_date].push(entry);
      return acc;
    },
    {} as Record<string, MemoryEntry[]>
  );

  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto max-w-3xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-[#6366f1]" />
              <h2 className="text-sm font-semibold text-white">Memory Log</h2>
            </div>
            <p className="mt-0.5 text-xs text-[#555]">
              Daily journal entries, decisions, and insights
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleCreateClick}
            className="gap-1.5 bg-indigo-600 text-xs text-white hover:bg-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" />
            New Entry
          </Button>
        </div>

        {/* Daily entries */}
        {sortedDates.map((date) => (
          <div key={date} className="mb-8">
            <div className="mb-3 flex items-center gap-3">
              <h3 className="text-xs font-medium text-[#999]">
                {formatDate(date)}
              </h3>
              <div className="h-px flex-1 bg-[#1e1e22]" />
            </div>
            <div className="flex flex-col gap-3">
              {groupedByDate[date].map((entry) => (
                <MemoryCard
                  key={entry.id}
                  entry={entry}
                  onClick={() => handleEditClick(entry)}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Long-term memory */}
        <Separator className="my-8 bg-[#1e1e22]" />

        <div className="mb-4 flex items-center gap-2">
          <Database className="h-4 w-4 text-[#06b6d4]" />
          <h2 className="text-sm font-semibold text-white">
            Long-Term Memory
          </h2>
          <Badge
            variant="outline"
            className="border-[#1e1e22] bg-[#111113] px-1.5 py-0 text-[10px] text-[#666]"
          >
            {longTermEntries.length} entries
          </Badge>
        </div>

        <div className="flex flex-col gap-3">
          {longTermEntries.map((entry) => (
            <MemoryCard
              key={entry.id}
              entry={entry}
              onClick={() => handleEditClick(entry)}
            />
          ))}
        </div>
      </div>

      <MemoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        entry={editingEntry}
        onSaved={fetchData}
      />
    </ScrollArea>
  );
}
