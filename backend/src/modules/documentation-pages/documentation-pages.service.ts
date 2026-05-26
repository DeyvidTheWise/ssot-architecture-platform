import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/app-error";
import { createVersionRecord } from "../../utils/version-history";

export const documentationPagesService = {
  async listProjectDocumentation(projectId: string) {
    return prisma.documentationPage.findMany({
      where: { projectId },
      include: {
        artifact: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    });
  },

  async getByArtifactId(artifactId: string) {
    const artifact = await prisma.artifact.findUnique({ where: { id: artifactId } });
    if (!artifact) {
      throw new AppError("Artifact not found", "NOT_FOUND", 404);
    }

    const page = await prisma.documentationPage.findUnique({ where: { artifactId } });

    return {
      artifact: {
        id: artifact.id,
        title: artifact.title,
        type: artifact.type,
        status: artifact.status
      },
      documentation: page
    };
  },

  async upsertByArtifactId(
    artifactId: string,
    actorId: string,
    payload: { markdownContent: string; renderedHtml?: string }
  ) {
    const artifact = await prisma.artifact.findUnique({ where: { id: artifactId } });
    if (!artifact) {
      throw new AppError("Artifact not found", "NOT_FOUND", 404);
    }

    const existing = await prisma.documentationPage.findUnique({ where: { artifactId } });

    const page = existing
      ? await prisma.documentationPage.update({
          where: { artifactId },
          data: {
            markdownContent: payload.markdownContent,
            renderedHtml: payload.renderedHtml
          }
        })
      : await prisma.documentationPage.create({
          data: {
            projectId: artifact.projectId,
            artifactId,
            markdownContent: payload.markdownContent,
            renderedHtml: payload.renderedHtml
          }
        });

    await createVersionRecord({
      projectId: artifact.projectId,
      entityType: "DocumentationPage",
      entityId: page.id,
      changeType: existing ? "UPDATED" : "CREATED",
      changedById: actorId,
      oldValue: existing
        ? {
            markdownContent: existing.markdownContent,
            renderedHtml: existing.renderedHtml
          }
        : null,
      newValue: {
        markdownContent: page.markdownContent,
        renderedHtml: page.renderedHtml
      }
    });

    return {
      artifact: {
        id: artifact.id,
        title: artifact.title,
        type: artifact.type,
        status: artifact.status
      },
      documentation: page
    };
  }
};