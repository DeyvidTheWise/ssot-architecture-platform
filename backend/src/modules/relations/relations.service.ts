import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/app-error";
import { createVersionRecord } from "../../utils/version-history";
import { emitToProject } from "../../websocket/server";

export const relationsService = {
  async createRelation(
    artifactIdFromPath: string,
    actorId: string,
    payload: {
      sourceArtifactId: string;
      targetArtifactId: string;
      relationType:
        | "DEPENDS_ON"
        | "DOCUMENTS"
        | "IMPLEMENTS"
        | "USES"
        | "EXPOSES"
        | "BELONGS_TO"
        | "SECURES"
        | "VALIDATES"
        | "COMMUNICATES_WITH";
      description?: string;
    }
  ) {
    if (artifactIdFromPath !== payload.sourceArtifactId) {
      throw new AppError("Path artifactId must match sourceArtifactId", "VALIDATION_ERROR", 400);
    }

    if (payload.sourceArtifactId === payload.targetArtifactId) {
      throw new AppError("Self relation is not allowed", "VALIDATION_ERROR", 400);
    }

    const [source, target] = await Promise.all([
      prisma.artifact.findUnique({ where: { id: payload.sourceArtifactId } }),
      prisma.artifact.findUnique({ where: { id: payload.targetArtifactId } })
    ]);

    if (!source || !target) {
      throw new AppError("Source or target artifact not found", "NOT_FOUND", 404);
    }

    if (source.projectId !== target.projectId) {
      throw new AppError("Cross-project relations are not allowed", "VALIDATION_ERROR", 400);
    }

    const duplicate = await prisma.artifactRelation.findFirst({
      where: {
        sourceArtifactId: payload.sourceArtifactId,
        targetArtifactId: payload.targetArtifactId,
        relationType: payload.relationType
      }
    });

    if (duplicate) {
      throw new AppError("Duplicate relation already exists", "CONFLICT", 409);
    }

    const relation = await prisma.artifactRelation.create({
      data: {
        projectId: source.projectId,
        sourceArtifactId: payload.sourceArtifactId,
        targetArtifactId: payload.targetArtifactId,
        relationType: payload.relationType,
        description: payload.description,
        createdById: actorId
      }
    });

    await createVersionRecord({
      projectId: relation.projectId,
      entityType: "ArtifactRelation",
      entityId: relation.id,
      changeType: "LINKED",
      changedById: actorId,
      newValue: {
        sourceArtifactId: relation.sourceArtifactId,
        targetArtifactId: relation.targetArtifactId,
        relationType: relation.relationType
      }
    });
    emitToProject(relation.projectId, "relation:created", {
      relationId: relation.id
    });

    return relation;
  },

  async listRelationsForArtifact(artifactId: string) {
    const artifact = await prisma.artifact.findUnique({ where: { id: artifactId } });
    if (!artifact) {
      throw new AppError("Artifact not found", "NOT_FOUND", 404);
    }

    const relations = await prisma.artifactRelation.findMany({
      where: {
        OR: [{ sourceArtifactId: artifactId }, { targetArtifactId: artifactId }]
      },
      include: {
        sourceArtifact: {
          select: { id: true, title: true, type: true, status: true }
        },
        targetArtifact: {
          select: { id: true, title: true, type: true, status: true }
        }
      },
      orderBy: { createdAt: "asc" }
    });

    const nodeMap = new Map<string, { id: string; label: string; type: string; status: string }>();

    relations.forEach((relation) => {
      nodeMap.set(relation.sourceArtifact.id, {
        id: relation.sourceArtifact.id,
        label: relation.sourceArtifact.title,
        type: relation.sourceArtifact.type,
        status: relation.sourceArtifact.status
      });
      nodeMap.set(relation.targetArtifact.id, {
        id: relation.targetArtifact.id,
        label: relation.targetArtifact.title,
        type: relation.targetArtifact.type,
        status: relation.targetArtifact.status
      });
    });

    const edges = relations.map((relation) => ({
      id: relation.id,
      source: relation.sourceArtifactId,
      target: relation.targetArtifactId,
      type: relation.relationType,
      description: relation.description,
      createdById: relation.createdById,
      createdAt: relation.createdAt,
      updatedAt: relation.updatedAt
    }));

    return {
      artifactId,
      nodes: Array.from(nodeMap.values()),
      edges
    };
  },

  async deleteRelation(relationId: string, actorId: string) {
    const relation = await prisma.artifactRelation.findUnique({ where: { id: relationId } });

    if (!relation) {
      throw new AppError("Relation not found", "NOT_FOUND", 404);
    }

    await prisma.artifactRelation.delete({ where: { id: relationId } });

    await createVersionRecord({
      projectId: relation.projectId,
      entityType: "ArtifactRelation",
      entityId: relation.id,
      changeType: "UNLINKED",
      changedById: actorId,
      oldValue: {
        sourceArtifactId: relation.sourceArtifactId,
        targetArtifactId: relation.targetArtifactId,
        relationType: relation.relationType
      }
    });
    emitToProject(relation.projectId, "relation:deleted", {
      relationId: relation.id
    });

    return { id: relationId };
  }
};
