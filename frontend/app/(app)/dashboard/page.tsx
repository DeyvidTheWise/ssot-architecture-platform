// app/(app)/dashboard/page.tsx
"use client";

import Link from "next/link";
import { Plus, Sparkles, Folder, Box, Shield, History, Star, Network, RefreshCw, ChevronRight } from "lucide-react";
import { PROJECTS, USERS, VERSIONS } from "@/lib/mock-data";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ProjectMark } from "@/components/ui/project-mark";
import { timeAgo } from "@/lib/utils";

export default function DashboardPage() {
  const totalArtifacts = PROJECTS.reduce((s, p) => s + p.artifactCount, 0);
  const totalIssues    = PROJECTS.reduce((s, p) => s + p.validationIssueCount, 0);

  return (
    <div className="px-8 py-7 max-w-[1320px] mx-auto">
      <PageHeader
        title="Good afternoon, Deyvid"
        subtitle={<>You have <strong className="text-fg">{totalIssues} open validation issues</strong> across {PROJECTS.length} projects.</>}
        actions={<>
          <Button icon={<Sparkles size={14} />}>Ask Minotaurus</Button>
          <Link href="/projects/new"><Button variant="primary" icon={<Plus size={14} />}>New project</Button></Link>
        </>}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat label="Projects"   value={PROJECTS.length}   delta="+1 this month"      deltaDir="up" icon={<Folder size={13} />}  spark={[3,3,3,3,4,4,4]} />
        <Stat label="Artifacts"  value={totalArtifacts}    delta="+8 this week"       deltaDir="up" icon={<Box size={13} />}     spark={[42,47,52,56,58,64,70]} />
        <Stat label="Open issues" value={totalIssues}      delta="-3 since last week" deltaDir="up" icon={<Shield size={13} />}  spark={[14,13,12,11,10,11,10]} />
        <Stat label="Changes"    value={VERSIONS.length}   delta="last 7 days"        deltaDir="flat" icon={<History size={13} />} spark={[2,5,4,6,8,12,10]} />
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-5">
        <div>
          <div className="flex items-center mb-3">
            <h2 className="m-0 text-base font-semibold tracking-tight">Your projects</h2>
            <div className="flex-1" />
            <Link href="/projects" className="text-[12.5px] text-fg-muted hover:text-fg flex items-center gap-1">View all <ChevronRight size={12} /></Link>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {PROJECTS.map((p) => (
              <Link key={p.id} href={`/projects/${p.id}`} className="block bg-panel border border-border rounded-lg p-[18px] hover:border-border-strong transition-colors">
                <div className="flex items-center gap-2.5 mb-3">
                  <ProjectMark color={p.color} size={28} letter={p.name[0]!} />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-[14px] tracking-tight">{p.name}</div>
                    <div className="text-[12px] text-fg-subtle font-mono truncate">{p.slug}</div>
                  </div>
                  {p.starred && <Star size={14} className="text-warning" />}
                </div>
                <div className="text-fg-muted text-[12.5px] mb-3.5 leading-relaxed min-h-8">{p.description}</div>
                <div className="flex items-center gap-3 text-[12px] text-fg-muted">
                  <span className="flex items-center gap-1"><Box size={12} />{p.artifactCount}</span>
                  <span className="flex items-center gap-1"><Shield size={12} />{p.validationIssueCount}</span>
                  <span className="flex items-center gap-1.5"><Avatar user={USERS[0]!} size={14} />+{p.members - 1}</span>
                  <span className="ml-auto text-[11.5px] text-fg-subtle">updated {timeAgo(p.updatedAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center mb-3">
            <h2 className="m-0 text-base font-semibold tracking-tight">Recent activity</h2>
            <div className="flex-1" />
            <Button variant="ghost" size="sm" icon={<RefreshCw size={12} />} />
          </div>
          <Card padded={false}>
            <div className="py-2">
              {RECENT.map((a, i) => (
                <div key={i} className="flex items-center gap-2.5 px-4 py-2.5">
                  <Avatar user={a.who} size={22} />
                  <div className="text-[13px] leading-relaxed min-w-0">
                    <strong>{a.who.firstName}</strong>{" "}
                    <span className="text-fg-muted">{a.action}</span>{" "}
                    <strong>{a.target}</strong>
                    <div className="text-fg-subtle text-[11.5px]">{a.at}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <div className="mt-5">
            <h2 className="m-0 mb-3 text-base font-semibold tracking-tight">Tips</h2>
            <Card>
              <div className="text-[13px] text-fg-muted leading-relaxed">
                <strong className="text-fg">Press <span className="kbd">⌘K</span></strong> to jump to any artifact, endpoint, or page. Minotaurus indexes everything you write.
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

const RECENT = [
  { who: USERS[2]!, action: "edited",              target: "Search Service",         at: "12m ago" },
  { who: USERS[1]!, action: "linked",              target: "Orders ↔ Notifications", at: "1h ago" },
  { who: USERS[3]!, action: "ran validation on",   target: "Helix Commerce",         at: "3h ago" },
  { who: USERS[1]!, action: "updated docs",        target: "Payments Runbook",       at: "yesterday" },
  { who: USERS[0]!, action: "deprecated",          target: "Webhooks Service",       at: "2d ago" },
];
