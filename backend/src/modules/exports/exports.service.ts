import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/app-error";
import { createVersionRecord } from "../../utils/version-history";
import { emitToProject } from "../../websocket/server";

type ExportSection = "ARTIFACTS" | "RELATIONS" | "GRAPH" | "API_SPECS" | "DIAGRAMS" | "VALIDATION_REPORT" | "VERSION_HISTORY";

const loadSectionData = async (projectId: string, section: ExportSection): Promise<unknown> => {
  switch (section) {
    case "ARTIFACTS":
      return prisma.artifact.findMany({ where: { projectId } });
    case "RELATIONS":
      return prisma.artifactRelation.findMany({ where: { projectId } });
    case "GRAPH": {
      const [nodes, edges] = await Promise.all([
        prisma.artifact.findMany({ where: { projectId }, select: { id: true, title: true, type: true, status: true } }),
        prisma.artifactRelation.findMany({ where: { projectId }, select: { id: true, sourceArtifactId: true, targetArtifactId: true, relationType: true } })
      ]);
      return { nodes, edges };
    }
    case "API_SPECS":
      return prisma.apiSpec.findMany({ where: { projectId }, include: { endpoints: true } });
    case "DIAGRAMS":
      return prisma.diagram.findMany({ where: { projectId } });
    case "VALIDATION_REPORT":
      return prisma.validationIssue.findMany({ where: { projectId } });
    case "VERSION_HISTORY":
      return prisma.versionHistory.findMany({ where: { projectId }, orderBy: { createdAt: "desc" } });
  }
};

const toMarkdown = (sections: Record<string, unknown>): string => {
  const lines: string[] = ["# SSOT Export", ""];

  Object.entries(sections).forEach(([name, content]) => {
    lines.push(`## ${name}`);
    lines.push("```json");
    lines.push(JSON.stringify(content, null, 2));
    lines.push("```");
    lines.push("");
  });

  return lines.join("\n");
};

export const exportsService = {
  async createExport(
    projectId: string,
    actorId: string,
    payload: { format: "JSON" | "MARKDOWN" | "ZIP"; sections: ExportSection[] }
  ) {
    if (payload.format === "ZIP") {
      throw new AppError("ZIP export is not implemented yet", "NOT_IMPLEMENTED", 501);
    }

    const sectionDataEntries = await Promise.all(payload.sections.map(async (section) => [section, await loadSectionData(projectId, section)] as const));
    const sectionData = Object.fromEntries(sectionDataEntries);

    const content = payload.format === "MARKDOWN" ? { markdown: toMarkdown(sectionData) } : sectionData;

    const exportPackage = await prisma.exportPackage.create({
      data: {
        projectId,
        format: payload.format,
        sections: payload.sections,
        content,
        createdById: actorId
      }
    });

    await createVersionRecord({
      projectId,
      entityType: "ExportPackage",
      entityId: exportPackage.id,
      changeType: "EXPORTED",
      changedById: actorId,
      newValue: {
        format: exportPackage.format,
        sections: payload.sections
      }
    });

    emitToProject(projectId, "export:completed", {
      exportId: exportPackage.id,
      format: exportPackage.format
    });

    return exportPackage;
  },

  async listProjectExports(projectId: string) {
    return prisma.exportPackage.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" }
    });
  },

  async getExportById(exportId: string) {
    const exportPackage = await prisma.exportPackage.findUnique({ where: { id: exportId } });
    if (!exportPackage) {
      throw new AppError("Export package not found", "NOT_FOUND", 404);
    }

    return exportPackage;
  }
};