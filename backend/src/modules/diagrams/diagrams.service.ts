import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/app-error";
import { createVersionRecord } from "../../utils/version-history";

const assertArtifactInProject = async (artifactId: string | undefined, projectId: string): Promise<void> => {
  if (!artifactId) {
    return;
  }

  const artifact = await prisma.artifact.findUnique({ where: { id: artifactId } });
  if (!artifact || artifact.projectId !== projectId) {
    throw new AppError("artifactId must refer to an artifact in the same project", "VALIDATION_ERROR", 400);
  }
};

export const diagramsService = {
  async listProjectDiagrams(projectId: string) {
    return prisma.diagram.findMany({ where: { projectId }, orderBy: { updatedAt: "desc" } });
  },

  async createDiagram(
    projectId: string,
    actorId: string,
    payload: { title: string; diagramType: "MERMAID" | "UML" | "ERD" | "ARCHITECTURE_FLOW" | "SEQUENCE" | "COMPONENT"; sourceCode: string; artifactId?: string }
  ) {
    await assertArtifactInProject(payload.artifactId, projectId);

    const diagram = await prisma.diagram.create({
      data: {
        projectId,
        artifactId: payload.artifactId,
        title: payload.title,
        diagramType: payload.diagramType,
        sourceCode: payload.sourceCode
      }
    });

    await createVersionRecord({
      projectId,
      entityType: "Diagram",
      entityId: diagram.id,
      changeType: "CREATED",
      changedById: actorId,
      newValue: {
        title: diagram.title,
        diagramType: diagram.diagramType,
        artifactId: diagram.artifactId
      }
    });

    return diagram;
  },

  async getDiagramById(diagramId: string) {
    const diagram = await prisma.diagram.findUnique({ where: { id: diagramId } });
    if (!diagram) {
      throw new AppError("Diagram not found", "NOT_FOUND", 404);
    }
    return diagram;
  },

  async updateDiagram(
    diagramId: string,
    actorId: string,
    payload: { title?: string; diagramType?: "MERMAID" | "UML" | "ERD" | "ARCHITECTURE_FLOW" | "SEQUENCE" | "COMPONENT"; sourceCode?: string; artifactId?: string }
  ) {
    const current = await prisma.diagram.findUnique({ where: { id: diagramId } });
    if (!current) {
      throw new AppError("Diagram not found", "NOT_FOUND", 404);
    }

    await assertArtifactInProject(payload.artifactId, current.projectId);

    const updated = await prisma.diagram.update({
      where: { id: diagramId },
      data: {
        title: payload.title,
        diagramType: payload.diagramType,
        sourceCode: payload.sourceCode,
        artifactId: payload.artifactId
      }
    });

    await createVersionRecord({
      projectId: current.projectId,
      entityType: "Diagram",
      entityId: current.id,
      changeType: "UPDATED",
      changedById: actorId,
      oldValue: {
        title: current.title,
        diagramType: current.diagramType,
        artifactId: current.artifactId
      },
      newValue: {
        title: updated.title,
        diagramType: updated.diagramType,
        artifactId: updated.artifactId
      }
    });

    return updated;
  },

  async deleteDiagram(diagramId: string, actorId: string) {
    const current = await prisma.diagram.findUnique({ where: { id: diagramId } });
    if (!current) {
      throw new AppError("Diagram not found", "NOT_FOUND", 404);
    }

    await prisma.diagram.delete({ where: { id: diagramId } });

    await createVersionRecord({
      projectId: current.projectId,
      entityType: "Diagram",
      entityId: current.id,
      changeType: "DELETED",
      changedById: actorId,
      oldValue: {
        title: current.title,
        diagramType: current.diagramType,
        artifactId: current.artifactId
      }
    });

    return { id: diagramId };
  }
};