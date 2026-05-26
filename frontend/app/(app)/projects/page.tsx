// app/(app)/projects/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Star, ChevronRight } from "lucide-react";
import { PROJECTS, USERS } from "@/lib/mock-data";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { ProjectMark } from "@/components/ui/project-mark";
import { Avatar } from "@/components/ui/avatar";
import { timeAgo } from "@/lib/utils";

export default function ProjectsPage() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("updated");

  let list = PROJECTS.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === "artifacts") list = [...list].sort((a, b) => b.artifactCount - a.artifactCount);
  else list = [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <div className="px-8 py-6 max-w-[1320px] mx-auto">
      <PageHeader
        title="Projects"
        subtitle={`${PROJECTS.length} projects · ${PROJECTS.reduce((s, p) => s + p.artifactCount, 0)} artifacts`}
        actions={<>
          <SearchInput value={q} onChange={setQ} placeholder="Filter projects…" className="w-[220px]" />
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-8 px-2.5 pr-7 bg-panel border border-border rounded-sm text-[13.5px] outline-none">
            <option value="updated">Recently updated</option>
            <option value="name">Name</option>
            <option value="artifacts">Most artifacts</option>
          </select>
          <Link href="/projects/new"><Button variant="primary" icon={<Plus size={14} />}>New project</Button></Link>
        </>}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((p) => (
          <Link key={p.id} href={`/projects/${p.id}`} className="block bg-panel border border-border rounded-lg p-[18px] hover:border-border-strong transition-colors">
            <div className="flex items-center gap-2.5 mb-3">
              <ProjectMark color={p.color} size={32} letter={p.name[0]!} />
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-[14.5px] tracking-tight">{p.name}</div>
                <div className="text-[12px] text-fg-subtle font-mono truncate">{p.slug}</div>
              </div>
              {p.starred && <Star size={14} className="text-warning" />}
            </div>
            <div className="text-fg-muted text-[13px] mb-4 leading-relaxed min-h-10">{p.description}</div>
            <div className="grid grid-cols-2 gap-2.5 mb-3">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-fg-subtle mb-1">Artifacts</div>
                <div className="text-base font-semibold">{p.artifactCount}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-fg-subtle mb-1">Issues</div>
                <div className={`text-base font-semibold ${p.validationIssueCount > 0 ? "text-warning" : ""}`}>{p.validationIssueCount}</div>
              </div>
            </div>
            <hr className="border-border" />
            <div className="flex items-center gap-2 mt-3">
              <div className="flex">
                {USERS.slice(0, 4).map((u, i) => (
                  <div key={u.id} style={{ marginLeft: i === 0 ? 0 : -8 }}>
                    <Avatar user={u} size={20} />
                  </div>
                ))}
              </div>
              <ChevronRight size={14} className="ml-auto text-fg-subtle" />
              <span className="text-[11.5px] text-fg-subtle">updated {timeAgo(p.updatedAt)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
