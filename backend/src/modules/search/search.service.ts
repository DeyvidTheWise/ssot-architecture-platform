import { prisma } from "../../config/prisma";

export const searchService = {
  async searchProject(projectId: string, q: string) {
    const [artifacts, documentation, apiEndpoints, diagrams] = await Promise.all([
      prisma.artifact.findMany({
        where: {
          projectId,
          OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }]
        },
        orderBy: { updatedAt: "desc" }
      }),
      prisma.documentationPage.findMany({
        where: {
          projectId,
          markdownContent: { contains: q, mode: "insensitive" }
        },
        include: {
          artifact: {
            select: { id: true, title: true, type: true, status: true }
          }
        },
        orderBy: { updatedAt: "desc" }
      }),
      prisma.apiEndpoint.findMany({
        where: {
          apiSpec: { projectId },
          OR: [{ path: { contains: q, mode: "insensitive" } }, { summary: { contains: q, mode: "insensitive" } }]
        },
        include: {
          apiSpec: { select: { id: true, name: true } }
        },
        orderBy: { updatedAt: "desc" }
      }),
      prisma.diagram.findMany({
        where: {
          projectId,
          OR: [{ title: { contains: q, mode: "insensitive" } }, { sourceCode: { contains: q, mode: "insensitive" } }]
        },
        orderBy: { updatedAt: "desc" }
      })
    ]);

    return {
      artifacts,
      documentation,
      apiEndpoints,
      diagrams
    };
  }
};