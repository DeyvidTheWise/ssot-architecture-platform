import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/app-error";
import { createVersionRecord } from "../../utils/version-history";

export const apiEndpointsService = {
  async listApiSpecEndpoints(apiSpecId: string) {
    return prisma.apiEndpoint.findMany({
      where: { apiSpecId },
      orderBy: [{ path: "asc" }, { method: "asc" }]
    });
  },

  async linkEndpointToArtifact(apiEndpointId: string, actorId: string, artifactId: string) {
    const endpoint = await prisma.apiEndpoint.findUnique({
      where: { id: apiEndpointId },
      include: { apiSpec: { select: { id: true, projectId: true } } }
    });

    if (!endpoint) {
      throw new AppError("API endpoint not found", "NOT_FOUND", 404);
    }

    const artifact = await prisma.artifact.findUnique({ where: { id: artifactId } });
    if (!artifact || artifact.projectId !== endpoint.apiSpec.projectId) {
      throw new AppError("artifactId must refer to an artifact in the same project", "VALIDATION_ERROR", 400);
    }

    const updated = await prisma.apiEndpoint.update({
      where: { id: apiEndpointId },
      data: { artifactId }
    });

    await createVersionRecord({
      projectId: endpoint.apiSpec.projectId,
      entityType: "ApiEndpoint",
      entityId: endpoint.id,
      changeType: "UPDATED",
      changedById: actorId,
      oldValue: { artifactId: endpoint.artifactId },
      newValue: { artifactId: updated.artifactId }
    });

    return updated;
  }
};