import { prisma } from "../../config/prisma";

const relationTypeToLabel = (relationType: string): string => {
  return relationType.toLowerCase().replaceAll("_", " ");
};

export const graphsService = {
  async getProjectGraph(projectId: string) {
    const [artifacts, relations] = await Promise.all([
      prisma.artifact.findMany({
        where: { projectId },
        select: {
          id: true,
          title: true,
          type: true,
          status: true
        },
        orderBy: { createdAt: "asc" }
      }),
      prisma.artifactRelation.findMany({
        where: { projectId },
        select: {
          id: true,
          sourceArtifactId: true,
          targetArtifactId: true,
          relationType: true
        },
        orderBy: { createdAt: "asc" }
      })
    ]);

    return {
      nodes: artifacts.map((artifact) => ({
        id: artifact.id,
        label: artifact.title,
        type: artifact.type,
        status: artifact.status
      })),
      edges: relations.map((relation) => ({
        id: relation.id,
        source: relation.sourceArtifactId,
        target: relation.targetArtifactId,
        type: relation.relationType,
        label: relationTypeToLabel(relation.relationType)
      }))
    };
  }
};