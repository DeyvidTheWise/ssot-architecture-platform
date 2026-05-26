// app/(app)/projects/new/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [tpl, setTpl] = useState("blank");

  const onSubmit = () => {
    // TODO: POST /api/projects via /lib/api/projects.ts
    toast.success(`Project "${name || "New project"}" created`);
    router.push("/projects/p_helix");
  };

  return (
    <div className="px-8 py-6 max-w-[720px] mx-auto">
      <PageHeader title="New project" subtitle="Create a workspace for documenting and validating a system." />
      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] text-fg-muted font-medium">Project name</label>
            <input className="bg-panel border border-border rounded-sm px-2.5 py-2 text-[13.5px] outline-none focus:border-accent"
              value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Helix Commerce" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] text-fg-muted font-medium">Description</label>
            <textarea className="bg-panel border border-border rounded-sm px-2.5 py-2 text-[13.5px] outline-none focus:border-accent min-h-[96px] resize-y"
              value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What does this project document?" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] text-fg-muted font-medium">Starter template</label>
            <div className="grid sm:grid-cols-3 gap-2.5">
              {[
                { id: "blank", label: "Blank", desc: "Empty project — start from scratch." },
                { id: "micro", label: "Microservices", desc: "Service, API, DB, doc and diagram templates." },
                { id: "monorepo", label: "Monorepo", desc: "Multi-package layout with shared types." },
              ].map((t) => (
                <label key={t.id} className="bg-panel border rounded-lg p-3.5 cursor-pointer" style={{
                  borderColor: tpl === t.id ? "var(--accent)" : "var(--border)",
                  boxShadow: tpl === t.id ? "0 0 0 3px var(--accent-soft)" : "none",
                }}>
                  <input type="radio" checked={tpl === t.id} onChange={() => setTpl(t.id)} className="hidden" />
                  <div className="font-semibold mb-1">{t.label}</div>
                  <div className="text-[12.5px] text-fg-muted">{t.desc}</div>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button onClick={() => router.push("/projects")}>Cancel</Button>
            <Button variant="primary" icon={<Plus size={14} />} onClick={onSubmit}>Create project</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
