// app/(app)/projects/[projectId]/artifacts/[artifactId]/page.tsx — artifact detail
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Edit, Link as LinkIcon, MoreHorizontal } from "lucide-react";
import { PROJECTS, ARTIFACTS, RELATIONS, ISSUES, BY_ID, EDGE_COLOR } from "@/lib/mock-data";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { TypeChip } from "@/components/ui/type-chip";
import { StatusBadge } from "@/components/ui/status-badge";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Empty } from "@/components/ui/empty";
import { GraphCanvas } from "@/components/graph/graph-canvas";
import { timeAgo } from "@/lib/utils";

export default function ArtifactDetailPage({ params }: { params: { projectId: string; artifactId: string } }) {
  const { projectId, artifactId } = params;
  const project = PROJECTS.find((p) => p.id === projectId);
  const a = BY_ID[artifactId];
  if (!project || !a) notFound();

  const [tab, setTab] = useState("overview");
  const incoming = RELATIONS.filter((r) => r.target === a.id);
  const outgoing = RELATIONS.filter((r) => r.source === a.id);
  const issues = ISSUES.filter((i) => i.artifactId === a.id);

  // Build a local subgraph (this artifact + direct neighbors arranged radially)
  const subgraph = useMemo(() => {
    const center = { ...a, gx: 0, gy: 0 };
    const ids = Array.from(new Set([
      ...incoming.map((r) => r.source),
      ...outgoing.map((r) => r.target),
    ]));
    const radius = 180;
    const items = ids.map((id, i) => {
      const n = BY_ID[id]; if (!n) return null;
      const ang = (i / ids.length) * Math.PI * 2;
      return { ...n, gx: Math.cos(ang) * radius, gy: Math.sin(ang) * radius };
    }).filter(Boolean) as typeof ARTIFACTS;
    const rels = RELATIONS.filter((r) => r.source === a.id || r.target === a.id);
    return { nodes: [center, ...items], rels };
  }, [a, incoming, outgoing]);

  return (
    <div className="px-8 py-6">
      <PageHeader
        eyebrow={<>
          <TypeChip type={a.type} />
          <StatusBadge status={a.status} />
          {a.tags.map((t) => <Badge key={t} mono>{t}</Badge>)}
        </>}
        title={a.title}
        subtitle={a.description}
        actions={<>
          <Button icon={<Edit size={13} />}>Edit</Button>
          <Button icon={<LinkIcon size={13} />}>Link</Button>
          <Button variant="ghost" icon={<MoreHorizontal size={14} />} size="sm" />
        </>}
      >
        <div className="flex items-center gap-4 text-[12px] text-fg-muted mt-2 flex-wrap">
          <span className="flex items-center gap-1.5"><Avatar user={a.author} size={14} /> {a.author.firstName} {a.author.lastName}</span>
          <span>Created {timeAgo(a.createdAt)}</span>
          <span>Updated {timeAgo(a.updatedAt)}</span>
          <span className="font-mono">{a.id}</span>
        </div>
      </PageHeader>

      <Tabs value={tab} onChange={setTab} tabs={[
        { id: "overview", label: "Overview" },
        { id: "relations", label: "Relations", count: incoming.length + outgoing.length },
        { id: "doc", label: "Documentation" },
        { id: "validation", label: "Validation", count: issues.length },
        { id: "history", label: "History" },
      ]} />

      {tab === "overview" && (
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5">
          <div className="flex flex-col gap-5">
            <Card title="Mini-graph" subtitle="This artifact and its direct neighbors" padded={false}>
              <div style={{ height: 300, position: "relative" }}>
                <GraphCanvas artifacts={subgraph.nodes} relations={subgraph.rels} selectedId={a.id} nodeStyle="color" draggable={false} fitView />
              </div>
            </Card>
            <Card title="Description"><div className="text-[14px] leading-relaxed">{a.description}</div></Card>
          </div>
          <div className="flex flex-col gap-5">
            <Card title="Metadata">
              <Meta k="Type"    v={<TypeChip type={a.type} />} />
              <Meta k="Status"  v={<StatusBadge status={a.status} />} />
              <Meta k="Owner"   v={<div className="flex items-center gap-1.5"><Avatar user={a.author} size={18} /><span className="text-[13px]">{a.author.firstName} {a.author.lastName}</span></div>} />
              <Meta k="Created" v={<span className="text-[13px] text-fg-muted">{new Date(a.createdAt).toLocaleDateString()}</span>} />
              <Meta k="Updated" v={<span className="text-[13px] text-fg-muted">{timeAgo(a.updatedAt)}</span>} />
              <Meta k="ID"      v={<span className="font-mono text-[12px] text-fg-muted">{a.id}</span>} last />
            </Card>
            <Card title={`Linked (${incoming.length + outgoing.length})`}>
              {[...outgoing, ...incoming].slice(0, 6).map((r) => {
                const isOut = r.source === a.id;
                const other = BY_ID[isOut ? r.target : r.source]; if (!other) return null;
                return (
                  <Link key={r.id} href={`/projects/${project.id}/artifacts/${other.id}`} className="flex items-center gap-2 py-2 border-b border-border last:border-0">
                    <TypeChip type={other.type} />
                    <span className="flex-1 min-w-0 text-[13px] truncate">{other.title}</span>
                    <span className="font-mono text-[10.5px] px-1.5 py-px rounded" style={{ color: EDGE_COLOR[r.type], border: `1px solid ${EDGE_COLOR[r.type]}33` }}>
                      {isOut ? "→ " : "← "}{r.type}
                    </span>
                  </Link>
                );
              })}
            </Card>
          </div>
        </div>
      )}

      {tab === "relations" && (
        <div className="grid grid-cols-2 gap-5">
          <Card title={`Outgoing (${outgoing.length})`}>
            {outgoing.length === 0 ? <div className="text-fg-muted text-[13px]">No outgoing relations.</div> :
              outgoing.map((r) => (
                <div key={r.id} className="flex items-center gap-2.5 py-2.5 border-b border-border last:border-0">
                  <span className="font-mono text-[10.5px] px-1.5 py-px rounded" style={{ color: EDGE_COLOR[r.type], border: `1px solid ${EDGE_COLOR[r.type]}33` }}>{r.type}</span>
                  <Link href={`/projects/${project.id}/artifacts/${r.target}`} className="flex items-center gap-2 min-w-0 flex-1">
                    <TypeChip type={BY_ID[r.target]!.type} />
                    <span className="text-[13px] font-medium truncate">{BY_ID[r.target]!.title}</span>
                  </Link>
                </div>
              ))
            }
          </Card>
          <Card title={`Incoming (${incoming.length})`}>
            {incoming.length === 0 ? <div className="text-fg-muted text-[13px]">No incoming relations.</div> :
              incoming.map((r) => (
                <div key={r.id} className="flex items-center gap-2.5 py-2.5 border-b border-border last:border-0">
                  <span className="font-mono text-[10.5px] px-1.5 py-px rounded" style={{ color: EDGE_COLOR[r.type], border: `1px solid ${EDGE_COLOR[r.type]}33` }}>{r.type}</span>
                  <Link href={`/projects/${project.id}/artifacts/${r.source}`} className="flex items-center gap-2 min-w-0 flex-1">
                    <TypeChip type={BY_ID[r.source]!.type} />
                    <span className="text-[13px] font-medium truncate">{BY_ID[r.source]!.title}</span>
                  </Link>
                </div>
              ))
            }
          </Card>
        </div>
      )}

      {tab === "doc" && (
        <Empty title="No documentation yet" message="Write a Markdown page to document this artifact." action={<Button variant="primary">Add documentation</Button>} />
      )}

      {tab === "validation" && (
        issues.length === 0 ? <Empty title="No issues for this artifact" message="It passes all validation checks." /> : (
          <Card padded={false}>
            <table className="w-full text-[13px]">
              <thead className="bg-panel"><tr className="text-fg-muted text-[11.5px] uppercase tracking-wider">
                <th className="text-left px-3.5 py-2.5 border-b border-border">Severity</th>
                <th className="text-left px-3.5 py-2.5 border-b border-border">Category</th>
                <th className="text-left px-3.5 py-2.5 border-b border-border">Message</th>
                <th className="text-left px-3.5 py-2.5 border-b border-border">Status</th>
              </tr></thead>
              <tbody>{issues.map((i) => (
                <tr key={i.id} className="border-b border-border last:border-0">
                  <td className="px-3.5 py-3"><SeverityBadge severity={i.severity} /></td>
                  <td className="px-3.5 py-3"><Badge mono>{i.category}</Badge></td>
                  <td className="px-3.5 py-3">{i.message}</td>
                  <td className="px-3.5 py-3"><StatusBadge status={i.status} /></td>
                </tr>
              ))}</tbody>
            </table>
          </Card>
        )
      )}

      {tab === "history" && (
        <Empty title="No history yet" message="Edits to this artifact will appear here." />
      )}
    </div>
  );
}

function Meta({ k, v, last }: { k: string; v: React.ReactNode; last?: boolean }) {
  return (
    <div className={`flex items-center py-2 ${last ? "" : "border-b border-border"}`}>
      <span className="w-[84px] text-[12px] text-fg-muted">{k}</span>
      <span>{v}</span>
    </div>
  );
}
