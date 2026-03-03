"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, type Document } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Search,
  FileText,
  FileCode,
  Settings,
  FileWarning,
  ArrowLeft,
  Plus,
  Pencil,
} from "lucide-react";
import { DocumentDialog } from "@/components/document-dialog";

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  markdown: FileText,
  config: Settings,
  code: FileCode,
  log: FileWarning,
};

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let inTable = false;
  let tableRows: string[][] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${i}`}
            className="my-2 overflow-x-auto rounded-lg border border-[#1e1e22] bg-[#0a0a0b] p-3 text-[11px] text-[#999]"
          >
            <code>{codeLines.join("\n")}</code>
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (line.startsWith("|")) {
      const cells = line
        .split("|")
        .filter((c) => c.trim())
        .map((c) => c.trim());
      if (cells.some((c) => /^[-:]+$/.test(c))) continue;
      if (!inTable) inTable = true;
      tableRows.push(cells);
      if (!lines[i + 1]?.startsWith("|")) {
        elements.push(
          <div
            key={`table-${i}`}
            className="my-2 overflow-x-auto rounded-lg border border-[#1e1e22]"
          >
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-[#1e1e22] bg-[#0a0a0b]">
                  {tableRows[0]?.map((cell, ci) => (
                    <th key={ci} className="px-3 py-1.5 text-left text-[#999]">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.slice(1).map((row, ri) => (
                  <tr key={ri} className="border-b border-[#1e1e22] last:border-0">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-1.5 text-[#888]">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
        inTable = false;
      }
      continue;
    }

    if (line.startsWith("### ")) {
      elements.push(
        <h4 key={i} className="mb-1 mt-4 text-xs font-semibold text-[#ccc]">
          {line.slice(4)}
        </h4>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h3 key={i} className="mb-2 mt-5 text-sm font-semibold text-[#e0e0e0]">
          {line.slice(3)}
        </h3>
      );
    } else if (line.startsWith("# ")) {
      elements.push(
        <h2 key={i} className="mb-3 mt-6 text-base font-bold text-white first:mt-0">
          {line.slice(2)}
        </h2>
      );
    } else if (line.startsWith("- [ ] ") || line.startsWith("- [x] ")) {
      const checked = line.startsWith("- [x] ");
      elements.push(
        <div key={i} className="flex items-center gap-2 py-0.5 pl-2">
          <div
            className={`h-3 w-3 rounded border ${checked ? "border-emerald-500 bg-emerald-500/20" : "border-[#444]"}`}
          />
          <span className={`text-xs ${checked ? "text-[#666] line-through" : "text-[#999]"}`}>
            {line.slice(6)}
          </span>
        </div>
      );
    } else if (line.startsWith("- **")) {
      const match = line.match(/^- \*\*(.+?)\*\*(.*)$/);
      if (match) {
        elements.push(
          <div key={i} className="flex gap-2 py-0.5 pl-2 text-xs">
            <span className="text-[#444]">&bull;</span>
            <span>
              <strong className="text-[#ccc]">{match[1]}</strong>
              <span className="text-[#888]">{match[2]}</span>
            </span>
          </div>
        );
      }
    } else if (line.startsWith("- ")) {
      elements.push(
        <div key={i} className="flex gap-2 py-0.5 pl-2 text-xs text-[#888]">
          <span className="text-[#444]">&bull;</span>
          <span>{line.slice(2)}</span>
        </div>
      );
    } else if (/^\d+\. /.test(line)) {
      const match = line.match(/^(\d+)\. (.*)$/);
      if (match) {
        elements.push(
          <div key={i} className="flex gap-2 py-0.5 pl-2 text-xs text-[#888]">
            <span className="text-[#555]">{match[1]}.</span>
            <span>{match[2]}</span>
          </div>
        );
      }
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      const parts = line.split(/(`[^`]+`)/);
      elements.push(
        <p key={i} className="text-xs leading-relaxed text-[#888]">
          {parts.map((part, pi) =>
            part.startsWith("`") && part.endsWith("`") ? (
              <code
                key={pi}
                className="rounded bg-[#1e1e22] px-1 py-0.5 text-[11px] text-[#ccc]"
              >
                {part.slice(1, -1)}
              </code>
            ) : (
              part
            )
          )}
        </p>
      );
    }
  }

  return <div className="space-y-0.5">{elements}</div>;
}

export function DocsView() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);

  const fetchData = useCallback(async () => {
    const { data } = await supabase
      .from("documents")
      .select("*")
      .order("updated_at", { ascending: false });
    if (data) {
      setDocuments(data);
      // Update selectedDoc if it was refreshed
      if (selectedDoc) {
        const updated = data.find((d) => d.id === selectedDoc.id);
        if (updated) setSelectedDoc(updated);
      }
    }
    setLoading(false);
  }, [selectedDoc]);

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleCreateClick() {
    setEditingDoc(null);
    setDialogOpen(true);
  }

  function handleEditClick(doc: Document) {
    setEditingDoc(doc);
    setDialogOpen(true);
  }

  function handleDialogSaved() {
    fetchData();
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="mb-2 h-4 w-32 animate-pulse rounded bg-[#1e1e22]" />
          <div className="h-3 w-48 animate-pulse rounded bg-[#1e1e22]" />
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg border border-[#1e1e22] bg-[#111113]" />
          ))}
        </div>
      </div>
    );
  }

  const allTags = Array.from(new Set(documents.flatMap((d) => d.tags)));

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      search === "" ||
      doc.title.toLowerCase().includes(search.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((t) => doc.tags.includes(t));
    return matchesSearch && matchesTags;
  });

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  if (selectedDoc) {
    return (
      <div className="flex h-full flex-col">
        {/* Doc header */}
        <div className="flex items-center gap-3 border-b border-[#1e1e22] px-6 py-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSelectedDoc(null)}
            className="text-[#666] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-sm font-semibold text-white">
              {selectedDoc.title}
            </h2>
            <p className="text-[10px] text-[#555]">{selectedDoc.doc_type}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {selectedDoc.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="border-[#1e1e22] bg-[#111113] px-1.5 py-0 text-[10px] text-[#666]"
              >
                {tag}
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditClick(selectedDoc)}
              className="gap-1.5 text-xs text-[#999] hover:bg-[#1e1e22] hover:text-white"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </Button>
          </div>
        </div>

        {/* Doc content */}
        <ScrollArea className="flex-1">
          <div className="mx-auto max-w-3xl p-8">
            <MarkdownRenderer content={selectedDoc.content ?? ""} />
          </div>
        </ScrollArea>

        <DocumentDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          document={editingDoc}
          onSaved={handleDialogSaved}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Search & filters */}
      <div className="border-b border-[#1e1e22] px-6 py-3">
        <div className="mb-3 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#555]" />
            <Input
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 border-[#1e1e22] bg-[#111113] pl-8 text-xs text-[#999] placeholder:text-[#444]"
            />
          </div>
          <Button
            size="sm"
            onClick={handleCreateClick}
            className="gap-1.5 bg-indigo-600 text-xs text-white hover:bg-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" />
            New Doc
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className={`cursor-pointer px-2 py-0 text-[10px] transition-colors ${
                selectedTags.includes(tag)
                  ? "border-[#6366f1] bg-[#6366f118] text-[#6366f1]"
                  : "border-[#1e1e22] bg-[#0a0a0b] text-[#555] hover:text-[#888]"
              }`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* File list */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="flex flex-col gap-1">
            {filteredDocs.map((doc) => {
              const Icon = typeIcons[doc.doc_type] || FileText;
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-[#111113]"
                >
                  <Icon className="h-4 w-4 flex-shrink-0 text-[#555]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[#e0e0e0]">
                        {doc.title}
                      </span>
                      <span className="text-[10px] text-[#444]">
                        {doc.file_size}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#555]">{doc.doc_type}</span>
                  </div>
                  <div className="flex gap-1">
                    {doc.tags.slice(0, 2).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="border-[#1e1e22] bg-[#0a0a0b] px-1.5 py-0 text-[10px] text-[#555]"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <span className="text-[10px] text-[#444]">
                    {doc.updated_at.split("T")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </ScrollArea>

      <DocumentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        document={editingDoc}
        onSaved={handleDialogSaved}
      />
    </div>
  );
}
