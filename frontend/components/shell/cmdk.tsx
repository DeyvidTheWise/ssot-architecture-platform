// components/shell/cmdk.tsx — command palette (⌘K)
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Folder, Box } from "lucide-react";
import { PROJECTS, ARTIFACTS, TYPE_INFO } from "@/lib/mock-data";
import { TypeChip } from "@/components/ui/type-chip";

interface Opt { kind: "page" | "project" | "artifact"; title: string; sub: string; href: string; type?: any; }

export function CmdK({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
    else { setQ(""); setIdx(0); }
  }, [open]);

  const items: Opt[] = useMemo(() => {
    const norm = q.trim().toLowerCase();
    const all: Opt[] = [
      { kind: "page", title: "Dashboard",      sub: "Home",      href: "/dashboard" },
      { kind: "page", title: "All projects",   sub: "Workspace", href: "/projects" },
      { kind: "page", title: "Create project", sub: "Workspace", href: "/projects/new" },
      { kind: "page", title: "Settings",       sub: "Account",   href: "/settings" },
      ...PROJECTS.map((p): Opt => ({ kind: "project", title: p.name, sub: "Project", href: `/projects/${p.id}` })),
      ...ARTIFACTS.map((a): Opt => ({ kind: "artifact", title: a.title, sub: TYPE_INFO[a.type]?.label || a.type, type: a.type, href: `/projects/p_helix/artifacts/${a.id}` })),
    ];
    if (!norm) return all.slice(0, 14);
    return all.filter((it) => it.title.toLowerCase().includes(norm) || it.sub.toLowerCase().includes(norm)).slice(0, 30);
  }, [q]);

  useEffect(() => { setIdx(0); }, [q]);

  if (!open) return null;

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(items.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
    else if (e.key === "Enter") {
      const it = items[idx];
      if (it) { router.push(it.href); onClose(); }
    } else if (e.key === "Escape") onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex justify-center items-start pt-[14vh]" onClick={onClose}>
      <div className="w-[560px] max-w-[92vw] bg-panel border border-border rounded-lg shadow-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKey}
          placeholder="Search projects, artifacts, endpoints… try 'auth' or 'orders'"
          className="w-full px-4 py-3.5 text-[14px] bg-transparent border-0 border-b border-border outline-none text-fg"
        />
        <div className="max-h-[360px] overflow-auto p-1.5">
          {items.length === 0 && <div className="p-4 text-center text-fg-muted text-[13px]">No results.</div>}
          {items.map((it, i) => (
            <div
              key={i}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer ${i === idx ? "bg-panel-hover" : ""}`}
              onMouseEnter={() => setIdx(i)}
              onClick={() => { router.push(it.href); onClose(); }}
            >
              {it.kind === "artifact" ? <TypeChip type={it.type} />
                : it.kind === "project" ? <Folder size={14} />
                : <ArrowRight size={14} />}
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] truncate">{it.title}</div>
                <div className="text-fg-muted text-[12px] truncate">{it.sub}</div>
              </div>
              <span className="kbd">↵</span>
            </div>
          ))}
        </div>
        <div className="px-3 py-2 border-t border-border flex gap-3.5 text-[11px] text-fg-subtle">
          <span><span className="kbd">↑</span> <span className="kbd">↓</span> navigate</span>
          <span><span className="kbd">↵</span> open</span>
          <span><span className="kbd">esc</span> close</span>
        </div>
      </div>
    </div>
  );
}
