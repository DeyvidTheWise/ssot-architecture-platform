// app/(app)/projects/[projectId]/validation/page.tsx
"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { Play } from "lucide-react";
import { toast } from "sonner";
import { PROJECTS, ISSUES, BY_ID, CATEGORIES_LIST } from "@/lib/mock-data-extra";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { TypeChip } from "@/components/ui/type-chip";
import { timeAgo } from "@/lib/utils";

export default function ValidationPage({ params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const project = PROJECTS.find((p) => p.id === projectId);
  if (!project) notFound();

  const [sev, setSev] = useState("ALL");
  const [cat, setCat] = useState("ALL");
  const [status, setStatus] = useState("OPEN");
  const [running, setRunning] = useState(false);

  const issues = ISSUES.filter((i) =>
    (sev === "ALL" || i.severity === sev) &&
    (cat === "ALL" || i.category === cat) &&
    (status === "ALL" || i.status === status)
  );

  const stats = {
    CRITICAL: ISSUES.filter((i) => i.status === "OPEN" && i.severity === "CRITICAL").length,
    ERROR:    ISSUES.filter((i) => i.status === "OPEN" && i.severity === "ERROR").length,
    WARNING:  ISSUES.filter((i) => i.status === "OPEN" && i.severity === "WARNING").length,
    INFO:     ISSUES.filter((i) => i.status === "OPEN" && i.severity === "INFO").length,
  };

  return (
    <div className="px-8 py-6">
      <PageHeader
        title="Validation"
        subtitle={`${ISSUES.filter((i) => i.status === "OPEN").length} open issues · last run 8 minutes ago`}
        actions={
          <Button variant="primary" icon={<Play size={14} />} onClick={() => {
            setRunning(true);
            // TODO: POST /api/projects/:id/validate
            setTimeout(() => { setRunning(false); toast.success("Validation complete · no new issues"); }, 1200);
          }}>{running ? "Running…" : "Run validation"}</Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {([
          ["Critical", stats.CRITICAL, "var(--c-danger)"],
          ["Errors",   stats.ERROR,    "var(--c-danger)"],
          ["Warnings", stats.WARNING,  "var(--c-warning)"],
          ["Info",     stats.INFO,     "var(--c-info)"],
        ] as const).map(([lbl, n, c]) => (
          <div key={lbl} className="bg-panel border border-border rounded-lg p-4">
            <div className="text-[12px] text-fg-muted">{lbl}</div>
            <div className="text-[28px] font-semibold tabular-nums" style={{ color: n > 0 ? c : "var(--fg)" }}>{n}</div>
          </div>
        ))}
      </div>

      <Card padded={false} title="All issues" action={
        <div className="flex items-center gap-2">
          <select value={sev} onChange={(e) => setSev(e.target.value)} className="h-8 px-2 pr-7 bg-panel border border-border rounded-sm text-[12.5px]">
            <option value="ALL">All severities</option>
            {["CRITICAL","ERROR","WARNING","INFO"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={cat} onChange={(e) => setCat(e.target.value)} className="h-8 px-2 pr-7 bg-panel border border-border rounded-sm text-[12.5px]">
            <option value="ALL">All categories</option>
            {CATEGORIES_LIST.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-8 px-2 pr-7 bg-panel border border-border rounded-sm text-[12.5px]">
            <option value="ALL">All status</option>
            <option value="OPEN">Open</option>
            <option value="RESOLVED">Resolved</option>
            <option value="IGNORED">Ignored</option>
          </select>
        </div>
      }>
        {issues.length === 0 ? (
          <div className="p-8 text-center text-fg-muted">No issues match these filters.</div>
        ) : (
          <table className="w-full text-[13px]">
            <thead className="bg-panel">
              <tr className="text-fg-muted text-[11.5px] uppercase tracking-wider">
                <th className="text-left px-3.5 py-2.5 border-b border-border">Severity</th>
                <th className="text-left px-3.5 py-2.5 border-b border-border">Category</th>
                <th className="text-left px-3.5 py-2.5 border-b border-border">Message</th>
                <th className="text-left px-3.5 py-2.5 border-b border-border">Artifact</th>
                <th className="text-left px-3.5 py-2.5 border-b border-border">Created</th>
                <th className="text-left px-3.5 py-2.5 border-b border-border">Status</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((i) => {
                const art = BY_ID[i.artifactId];
                return (
                  <tr key={i.id} className="border-b border-border last:border-0 hover:bg-panel-hover">
                    <td className="px-3.5 py-3"><SeverityBadge severity={i.severity} /></td>
                    <td className="px-3.5 py-3"><Badge mono>{i.category}</Badge></td>
                    <td className="px-3.5 py-3">{i.message}</td>
                    <td className="px-3.5 py-3">{art && <div className="flex items-center gap-2"><TypeChip type={art.type} /><span className="font-medium">{art.title}</span></div>}</td>
                    <td className="px-3.5 py-3 text-fg-muted text-[12.5px]">{timeAgo(i.createdAt)}</td>
                    <td className="px-3.5 py-3"><StatusBadge status={i.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
