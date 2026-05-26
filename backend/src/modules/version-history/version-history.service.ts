import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/app-error";

export const versionHistoryService = {
  async listProjectVersions(projectId: string, filters: { entityType?: string; changeType?: string }) {
    return prisma.versionHistory.findMany({
      where: {
        projectId,
        entityType: filters.entityType,
        changeType: filters.changeType as never
      },
      orderBy: { createdAt: "desc" }
    });
  },

  async listArtifactVersions(artifactId: string) {
    const artifact = await prisma.artifact.findUnique({ where: { id: artifactId } });
    if (!artifact) {
      throw new AppError("Artifact not found", "NOT_FOUND", 404);
    }

    return prisma.versionHistory.findMany({
      where: {
        projectId: artifact.projectId,
        OR: [{ entityId: artifactId }, { oldValue: { path: ["artifactId"], equals: artifactId } }, { newValue: { path: ["artifactId"], equals: artifactId } }]
      },
      orderBy: { createdAt: "desc" }
    });
  }
};