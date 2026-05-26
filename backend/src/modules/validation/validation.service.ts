import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/app-error";
import { createVersionRecord } from "../../utils/version-history";
import { emitToProject } from "../../websocket/server";

interface Detection {
  projectId: string;
  artifactId: string | null;
  severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  category: "DOCUMENTATION" | "API" | "DATABASE" | "SECURITY" | "ARCHITECTURE" | "RELATIONSHIP" | "VERSIONING";
  message: string;
}

const keyOf = (d: Detection): string => `${d.artifactId ?? "none"}|${d.category}|${d.severity}|${d.message}`;

export const validationService = {
  async runValidation(projectId: string, actorId: string) {
    const [artifacts, relations, apiEndpoints, docs, existingIssues] = await Promise.all([
      prisma.artifact.findMany({ where: { projectId } }),
      prisma.artifactRelation.findMany({ where: { projectId } }),
      prisma.apiEndpoint.findMany({
        where: { apiSpec: { projectId } },
        include: { apiSpec: { select: { projectId: true } } }
      }),
      prisma.documentationPage.findMany({ where: { projectId }, select: { artifactId: true } }),
      prisma.validationIssue.findMany({ where: { projectId, status: "OPEN" } })
    ]);

    const detected: Detection[] = [];

    const relationUsage = new Map<string, number>();
    relations.forEach((r) => {
      relationUsage.set(r.sourceArtifactId, (relationUsage.get(r.sourceArtifactId) ?? 0) + 1);
      relationUsage.set(r.targetArtifactId, (relationUsage.get(r.targetArtifactId) ?? 0) + 1);
    });

    artifacts.forEach((artifact) => {
      if (!relationUsage.has(artifact.id)) {
        detected.push({
          projectId,
          artifactId: artifact.id,
          category: "RELATIONSHIP",
          severity: "WARNING",
          message: "Artifact is not connected to any other artifact."
        });
      }
    });

    apiEndpoints.forEach((endpoint) => {
      if (!endpoint.artifactId) {
        detected.push({
          projectId,
          artifactId: null,
          category: "API",
          severity: "WARNING",
          message: "API endpoint is not linked to an artifact."
        });
      }
    });

    const documentedArtifactIds = new Set(docs.map((d) => d.artifactId));
    artifacts
      .filter((a) => a.type === "DOCUMENTATION")
      .forEach((artifact) => {
        if (!documentedArtifactIds.has(artifact.id)) {
          detected.push({
            projectId,
            artifactId: artifact.id,
            category: "DOCUMENTATION",
            severity: "WARNING",
            message: "Documentation artifact has no documentation page."
          });
        }
      });

    const artifactById = new Map(artifacts.map((a) => [a.id, a]));
    relations
      .filter((r) => r.relationType === "DEPENDS_ON")
      .forEach((relation) => {
        const source = artifactById.get(relation.sourceArtifactId);
        const target = artifactById.get(relation.targetArtifactId);
        if (source?.status === "ACTIVE" && target?.status === "DEPRECATED") {
          detected.push({
            projectId,
            artifactId: source.id,
            category: "ARCHITECTURE",
            severity: "ERROR",
            message: "Active artifact depends on deprecated artifact."
          });
        }
      });

    artifacts
      .filter((a) => a.type === "SECURITY_POLICY")
      .forEach((artifact) => {
        const hasSecures = relations.some((r) => r.sourceArtifactId === artifact.id && r.relationType === "SECURES");
        if (!hasSecures) {
          detected.push({
            projectId,
            artifactId: artifact.id,
            category: "SECURITY",
            severity: "WARNING",
            message: "Security policy is not linked to any secured artifact."
          });
        }
      });

    const uniqueDetections = Array.from(new Map(detected.map((d) => [keyOf(d), d])).values());

    const existingByKey = new Map(
      existingIssues.map((issue) => [
        `${issue.artifactId ?? "none"}|${issue.category}|${issue.severity}|${issue.message}`,
        issue
      ])
    );

    const currentKeys = new Set(uniqueDetections.map(keyOf));

    const toResolve = existingIssues.filter((issue) => !currentKeys.has(`${issue.artifactId ?? "none"}|${issue.category}|${issue.severity}|${issue.message}`));

    if (toResolve.length > 0) {
      await prisma.validationIssue.updateMany({
        where: { id: { in: toResolve.map((i) => i.id) } },
        data: { status: "RESOLVED" }
      });
    }

    const newIssues = uniqueDetections.filter((d) => !existingByKey.has(keyOf(d)));

    if (newIssues.length > 0) {
      await prisma.validationIssue.createMany({
        data: newIssues.map((issue) => ({
          projectId: issue.projectId,
          artifactId: issue.artifactId,
          severity: issue.severity,
          category: issue.category,
          message: issue.message,
          status: "OPEN"
        }))
      });
    }

    await createVersionRecord({
      projectId,
      entityType: "Validation",
      entityId: projectId,
      changeType: "VALIDATED",
      changedById: actorId,
      newValue: { detected: uniqueDetections.length }
    });

    const openIssues = await prisma.validationIssue.findMany({ where: { projectId, status: "OPEN" } });

    const summary = {
      total: openIssues.length,
      info: openIssues.filter((i) => i.severity === "INFO").length,
      warning: openIssues.filter((i) => i.severity === "WARNING").length,
      error: openIssues.filter((i) => i.severity === "ERROR").length,
      critical: openIssues.filter((i) => i.severity === "CRITICAL").length
    };

    emitToProject(projectId, "validation:completed", summary);

    return summary;
  },

  async listIssues(projectId: string, filters: { status?: string; severity?: string; category?: string }) {
    return prisma.validationIssue.findMany({
      where: {
        projectId,
        status: filters.status as never,
        severity: filters.severity as never,
        category: filters.category as never
      },
      orderBy: { createdAt: "desc" }
    });
  },

  async updateIssue(issueId: string, status: "RESOLVED" | "IGNORED") {
    const issue = await prisma.validationIssue.findUnique({ where: { id: issueId } });
    if (!issue) {
      throw new AppError("Validation issue not found", "NOT_FOUND", 404);
    }

    return prisma.validationIssue.update({
      where: { id: issueId },
      data: { status }
    });
  }
};