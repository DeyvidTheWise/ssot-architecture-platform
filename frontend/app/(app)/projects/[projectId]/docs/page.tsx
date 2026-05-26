"use client";
import { StubPage } from "@/components/ui/stub-page";

export default function DocsListPage() {
  return <StubPage
    title="Documentation"
    description="Markdown editor with live preview and Mermaid rendering. Backed by GET /api/projects/:id/docs and PUT /api/artifacts/:id/documentation."
  />;
}
