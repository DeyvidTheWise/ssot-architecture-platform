// app/(app)/projects/[projectId]/graph/page.tsx — full-screen knowledge graph
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RefreshCw, Link as LinkIcon, ArrowRight } from "lucide-react";
import { PROJECTS, ARTIFACTS, RELATIONS, ARTIFACT_TYPES, EDGE_COLOR, BY_ID } from "@/lib/mock-data";
import type { Artifact, ArtifactType } from "@/lib/types";
import { GraphCanvas } from "@/components/graph/graph-canvas";
import { GraphLegend } from "@/components/graph/graph-legend";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { SearchInput } from "@/components/ui/search-input";
import { TypeChip } from "@/components/ui/type-chip";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { useTweaks } from "@/components/providers";

export default function GraphPage({ params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const project = PROJECTS.find((p) => p.id === projectId);
  if (!project) notFound();

  const { graphNodeStyle, set } = useTweaks();
  const [typeFilter, setTypeFilter] = useState<Set<string> | null>(null);
  const [selected, setSelected] = useState<Artifact | null>(null);
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    ARTIFACTS.forEach((a) => { m[a.type] = (m[a.type] || 0) + 1; });
    return m;
  }, []);

  const toggleType = (t: ArtifactType) => {
    setTypeFilter((prev) => {
      const set = new Set(prev || ARTIFACT_TYPES);
      if (set.has(t)) set.delete(t); else set.add(t);
      if (set.size === ARTIFACT_TYPES.length) return null;
      return set;
    });
  };

  const incoming = selected ? RELATIONS.filter((r) => r.target === selected.id) : [];
  const outgoing = selected ? RELATIONS.filter((r) => r.source === selected.id) : [];

  return (
    <div className="grid h-full overflow-hidden" style={{ gridTemplateRows: "auto 1fr" }}>
      <div className="px-4 py-3 border-b border-border flex items-center gap-2.5 flex-wrap">
        <div className="min-w-0">
          <div className="text-[14.5px] font-semibold">Knowledge graph</div>
          <div className="text-[12px] text-fg-muted whitespace-nowrap">{ARTIFACTS.length} artifacts · {RELATIONS.length} relations</div>
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Find a node…" className="w-[200px] ml-1" />
        <div className="flex-1" />
        <span className="text-[12px] text-fg-muted whitespace-nowrap">Node style</span>
        <Segmented value={graphNodeStyle} onChange={(v) => set("graphNodeStyle", v)} options={[
          { value: "shape", label: "Shape" },
          { value: "color", label: "Color" },
          { value: "minimal", label: "Minimal" },
        ]} />
        <Button icon={<RefreshCw size={14} />}>Validate</Button>
        <Button variant="primary" icon={<LinkIcon size={14} />}>Create relation</Button>
      </div>

      <div className="relative overflow-hidden">
        <GraphCanvas
          artifacts={ARTIFACTS}
          relations={RELATIONS}
          selectedId={selected?.id || null}
          onSelect={setSelected}
          typeFilter={typeFilter}
          nodeStyle={graphNodeStyle}
          storageKey={`project:${projectId}`}
        />
        <GraphLegend typeFilter={typeFilter} onToggle={toggleType} counts={counts} />

        <Drawer open={!!selected} onClose={() => setSelected(null)} title="Artifact details" width={400}>
          {selected && (
            <>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <TypeChip type={selected.type} />
                  <StatusBadge status={selected.status} />
                </div>
                <div className="text-base font-semibold mb-1">{selected.title}</div>
                <div className="text-[13px] text-fg-muted">{selected.description}</div>
              </div>

              {selected.tags.length > 0 && (
                <div className="mb-4">
                  <div className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-subtle mb-2">Tags</div>
                  <div className="flex gap-1.5 flex-wrap">{selected.tags.map((t) => <Badge key={t} mono>{t}</Badge>)}</div>
                </div>
              )}

              <RelList title={`Outgoing (${outgoing.length})`} rels={outgoing} project={project.id} side="out" />
              <RelList title={`Incoming (${incoming.length})`} rels={incoming} project={project.id} side="in" />

              <div className="flex gap-2 mt-2.5">
                <Link href={`/projects/${project.id}/artifacts/${selected.id}`}>
                  <Button variant="primary">Open artifact <ArrowRight size={14} /></Button>
                </Link>
                <Button icon={<LinkIcon size={13} />}>Link…</Button>
              </div>
            </>
          )}
        </Drawer>
      </div>
    </div>
  );
}

function RelList({ title, rels, project, side }: { title: string; rels: { id: string; source: string; target: string; type: keyof typeof EDGE_COLOR }[]; project: string; side: "in" | "out" }) {
  return (
    <div className="mb-4">
      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-fg-subtle mb-2">{title}</div>
      {rels.map((r) => {
        const otherId = side === "out" ? r.target : r.source;
        const other = BY_ID[otherId];
        if (!other) return null;
        return (
          <div key={r.id} className="flex items-center gap-2 py-1.5 text-[13px]">
            <span className="font-mono text-[10px] px-1.5 rounded" style={{ color: EDGE_COLOR[r.type], border: `1px solid ${EDGE_COLOR[r.type]}33` }}>{r.type}</span>
            <Link href={`/projects/${project}/artifacts/${other.id}`} className="min-w-0 hover:underline truncate">{other.title}</Link>
          </div>
        );
      })}
    </div>
  );
}
