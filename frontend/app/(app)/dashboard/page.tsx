"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Plus, Folder, Box, Shield, RefreshCw, ChevronRight } from "lucide-react";
import { projectApi } from "@/lib/api";
import type { ProjectDto } from "@/types/dto";
import { useAuthStore } from "@/stores/auth-store";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { ProjectMark } from "@/components/ui/project-mark";

export default function DashboardPage() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadProjects = async (): Promise<void> => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const result = await projectApi.list();
      setProjects(result);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProjects();
  }, []);

  const totals = useMemo(() => ({ projects: projects.length }), [projects]);

  return (
    <div className="px-8 py-7 max-w-[1320px] mx-auto">
      <PageHeader
        title={`Welcome${currentUser ? `, ${currentUser.firstName}` : ""}`}
        subtitle="Your backend-connected SSOT workspace overview."
        actions={
          <>
            <Link href="/projects/new">
              <Button variant="primary" icon={<Plus size={14} />}>
                New project
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Stat label="Projects" value={totals.projects} delta="backend connected" deltaDir="flat" icon={<Folder size={13} />} />
        <Stat label="Artifacts" value="-" delta="Open project to view" deltaDir="flat" icon={<Box size={13} />} />
        <Stat label="Open issues" value="-" delta="Run validation per project" deltaDir="flat" icon={<Shield size={13} />} />
      </div>

      <div className="flex items-center mb-3">
        <h2 className="m-0 text-base font-semibold tracking-tight">Your projects</h2>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" icon={<RefreshCw size={12} />} onClick={() => void loadProjects()} />
      </div>

      {loading ? (
        <Card>
          <div className="text-sm text-fg-muted">Loading projects...</div>
        </Card>
      ) : errorMessage ? (
        <Card>
          <div className="text-sm text-danger">{errorMessage}</div>
        </Card>
      ) : projects.length === 0 ? (
        <Card>
          <div className="text-sm text-fg-muted">No projects yet. Create your first project to start.</div>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`} className="block bg-panel border border-border rounded-lg p-[18px] hover:border-border-strong transition-colors">
              <div className="flex items-center gap-2.5 mb-3">
                <ProjectMark color="#3b82f6" size={28} letter={project.name[0] ?? "P"} />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-[14px] tracking-tight">{project.name}</div>
                  <div className="text-[12px] text-fg-subtle font-mono truncate">{project.id}</div>
                </div>
              </div>
              <div className="text-fg-muted text-[12.5px] mb-3.5 leading-relaxed min-h-8">{project.description ?? "No description"}</div>
              <div className="flex items-center gap-2 text-[12px] text-fg-muted">
                <span>Updated {new Date(project.updatedAt).toLocaleString()}</span>
                <span className="ml-auto flex items-center gap-1">
                  Open <ChevronRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}