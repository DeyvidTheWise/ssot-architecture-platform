import type { ArtifactStatus, ArtifactType } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/app-error";
import { createVersionRecord } from "../../utils/version-history";
import { emitToProject } from "../../websocket/server";
import type { CreateArtifactDto, UpdateArtifactDto } from "./artifacts.types";

const ARTIFACT_TYPES: ArtifactType[] = [
  "DOCUMENTATION",
  "API_SPEC",
  "API_ENDPOINT",
  "SERVICE",
  "DATABASE_MODEL",
  "DATABASE_ENTITY",
  "DIAGRAM",
  "REQUIREMENT",
  "SECURITY_POLICY",
  "MODULE",
  "EXTERNAL_SYSTEM",
  "DEPLOYMENT"
];

const ARTIFACT_STATUSES: ArtifactStatus[] = ["DRAFT", "ACTIVE", "DEPRECATED", "ARCHIVED"];

export const artifactsService = {
  async createArtifact(projectId: string, actorId: string, dto: CreateArtifactDto) {
    const artifact = await prisma.artifact.create({
      data: {
        projectId,
        title: dto.title,
        type: dto.type,
        description: dto.description,
        status: dto.status,
        createdById: actorId
      }
    });

    await createVersionRecord({
      projectId,
      entityType: "Artifact",
      entityId: artifact.id,
      changeType: "CREATED",
      changedById: actorId,
      newValue: {
        title: artifact.title,
        type: artifact.type,
        status: artifact.status
      }
    });
    emitToProject(projectId, "artifact:created", {
      artifactId: artifact.id
    });

    return artifact;
  },

  async listArtifacts(projectId: string, query: { type?: string; status?: string; q?: string }) {
    const type = query.type && ARTIFACT_TYPES.includes(query.type as ArtifactType) ? (query.type as ArtifactType) : undefined;
    const status =
      query.status && ARTIFACT_STATUSES.includes(query.status as ArtifactStatus) ? (query.status as ArtifactStatus) : undefined;

    return prisma.artifact.findMany({
      where: {
        projectId,
        type,
        status,
        OR: query.q
          ? [
              { title: { contains: query.q, mode: "insensitive" } },
              { description: { contains: query.q, mode: "insensitive" } }
            ]
          : undefined
      },
      orderBy: { updatedAt: "desc" }
    });
  },

  async getArtifactById(artifactId: string) {
    const artifact = await prisma.artifact.findUnique({ where: { id: artifactId } });
    if (!artifact) {
      throw new AppError("Artifact not found", "NOT_FOUND", 404);
    }
    return artifact;
  },

  async updateArtifact(artifactId: string, actorId: string, dto: UpdateArtifactDto) {
    const current = await prisma.artifact.findUnique({ where: { id: artifactId } });
    if (!current) {
      throw new AppError("Artifact not found", "NOT_FOUND", 404);
    }

    const artifact = await prisma.artifact.update({
      where: { id: artifactId },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status
      }
    });

    await createVersionRecord({
      projectId: artifact.projectId,
      entityType: "Artifact",
      entityId: artifact.id,
      changeType: "UPDATED",
      changedById: actorId,
      oldValue: {
        title: current.title,
        description: current.description,
        status: current.status
      },
      newValue: {
        title: artifact.title,
        description: artifact.description,
        status: artifact.status
      }
    });
    emitToProject(artifact.projectId, "artifact:updated", {
      artifactId: artifact.id
    });

    return artifact;
  },

  async deleteArtifact(artifactId: string, actorId: string) {
    const current = await prisma.artifact.findUnique({ where: { id: artifactId } });
    if (!current) {
      throw new AppError("Artifact not found", "NOT_FOUND", 404);
    }

    await prisma.artifact.delete({ where: { id: artifactId } });

    await createVersionRecord({
      projectId: current.projectId,
      entityType: "Artifact",
      entityId: current.id,
      changeType: "DELETED",
      changedById: actorId,
      oldValue: {
        title: current.title,
        type: current.type,
        status: current.status
      }
    });
    emitToProject(current.projectId, "artifact:deleted", {
      artifactId: current.id
    });

    return { id: artifactId };
  }
};
