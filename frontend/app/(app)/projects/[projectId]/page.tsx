// app/(app)/projects/[projectId]/page.tsx — workspace overview
"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { RefreshCw, Upload, Plus, Box, Plug, BookOpen, Network, Shield, Package, ExternalLink, Star } from "lucide-react";
import { PROJECTS, ARTIFACTS, RELATIONS, ISSUES, VERSIONS } from "@/lib/mock-data";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { ProjectMark } from "@/components/ui/project-mark";
import { GraphCanvas } from "@/components/graph/graph-canvas";
import { timeAgo } from "@/lib/utils";
import { BY_ID } from "@/lib/mock-data";

export default function WorkspacePage({ params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const project = PROJECTS.find((p) => p.id === projectId);
  if (!project) notFound();

  const openIssues = ISSUES.filter((i) => i.status === "OPEN");
  const recent = VERSIONS.slice(0, 4);

  return (
    <div className="px-8 py-6">
      <PageHeader
        title={
          <div className="flex items-center gap-3 flex-wrap">
            <ProjectMark color={project.color} size={42} letter={project.name[0]!} />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight m-0 flex items-center gap-2.5">
                {project.name}
                <StatusBadge status="ACTIVE" />
                {project.starred && <Star size={16} className="text-warning" />}
              </h1>
              <div className="text-fg-muted text-[13.5px] mt-1">{project.description}</div>
            </div>
          </div>
        }
        actions={<>
          <Button icon={<RefreshCw size={14} />}>Run validation</Button>
          <Link href={`/projects/${project.id}/export`}><Button icon={<Upload size={14} />}>Export SSOT</Button></Link>
          <Link href={`/projects/${project.id}/artifacts/new`}><Button variant="primary" icon={<Plus size={14} />}>New artifact</Button></Link>
        </>}
      />

      <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5 mb-7">
        {[
          { icon: <Box />,      label: "New artifact", href: `/projects/${project.id}/artifacts/new` },
          { icon: <Plug />,     label: "Import API",   href: `/projects/${project.id}/api` },
          { icon: <BookOpen />, label: "Docs",         href: `/projects/${project.id}/docs` },
          { icon: <Network />,  label: "Graph",        href: `/projects/${project.id}/graph` },
          { icon: <Shield />,   label: "Validation",   href: `/projects/${project.id}/validation` },
          { icon: <Package />,  label: "Export",       href: `/projects/${project.id}/export` },
        ].map((q, i) => (
          <Link key={i} href={q.href} className="bg-panel border border-border rounded-lg p-3.5 flex flex-col gap-2 hover:border-border-strong transition-colors">
            <div className="w-[30px] h-[30px] rounded-md bg-accent-soft text-accent grid place-items-center">
              {/* @ts-ignore */}
              {q.icon}
            </div>
            <div className="text-[13.5px] font-medium">{q.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        <Card
          title="Knowledge graph"
          subtitle={`${ARTIFACTS.length} nodes · ${RELATIONS.length} relations`}
          action={<Link href={`/projects/${project.id}/graph`} className="text-[12.5px] text-fg-muted hover:text-fg flex items-center gap-1">Open <ExternalLink size={12} /></Link>}
          padded={false}
        >
          <div style={{ height: 360, position: "relative" }}>
            <GraphCanvas artifacts={ARTIFACTS} relations={RELATIONS} nodeStyle="color" storageKey={`project:${projectId}:mini`} />
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          <Card title="Validation snapshot" action={
            <Link href={`/projects/${project.id}/validation`} className="text-[12.5px] text-fg-muted hover:text-fg flex items-center gap-1">Open <ExternalLink size={12} /></Link>
          }>
            <div className="grid grid-cols-4 gap-2 mb-3.5">
              {[
                { lbl: "Critical", n: openIssues.filter((i) => i.severity === "CRITICAL").length, c: "var(--c-danger)" },
                { lbl: "Errors",   n: openIssues.filter((i) => i.severity === "ERROR").length,    c: "var(--c-danger)" },
                { lbl: "Warnings", n: openIssues.filter((i) => i.severity === "WARNING").length,  c: "var(--c-warning)" },
                { lbl: "Info",     n: openIssues.filter((i) => i.severity === "INFO").length,     c: "var(--c-info)" },
              ].map((s) => (
                <div key={s.lbl} className="bg-panel-2 border border-border rounded-md p-2.5">
                  <div className="text-[10.5px] text-fg-subtle uppercase tracking-wider">{s.lbl}</div>
                  <div className="text-[22px] font-semibold" style={{ color: s.n > 0 ? s.c : "var(--fg-subtle)" }}>{s.n}</div>
                </div>
              ))}
            </div>
            {openIssues.slice(0, 3).map((iss) => (
              <Link key={iss.id} href={`/projects/${project.id}/artifacts/${iss.artifactId}`} className="flex items-center gap-2.5 py-2 border-b border-border last:border-0">
                <SeverityBadge severity={iss.severity} />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] truncate">{iss.message}</div>
                  <div className="text-[11.5px] text-fg-muted">{BY_ID[iss.artifactId]?.title}</div>
                </div>
              </Link>
            ))}
          </Card>

          <Card title="Recent changes" action={
            <Link href={`/projects/${project.id}/versions`} className="text-[12.5px] text-fg-muted hover:text-fg flex items-center gap-1">Open <ExternalLink size={12} /></Link>
          }>
            <div className="flex flex-col gap-2.5">
              {recent.map((v) => (
                <div key={v.id} className="text-[12.5px] text-fg-muted">
                  <strong className="text-fg">{v.changedBy.firstName}</strong>{" "}
                  {v.changeType.toLowerCase()} <span className="font-mono">{v.entityType.toLowerCase()}</span> · {timeAgo(v.createdAt)}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
