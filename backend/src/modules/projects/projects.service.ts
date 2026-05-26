import { prisma } from "../../config/prisma";
import type { UserRole } from "@prisma/client";
import { AppError } from "../../utils/app-error";
import { createVersionRecord } from "../../utils/version-history";
import type { CreateProjectDto, UpdateProjectDto } from "./projects.types";

export const projectsService = {
  async createProject(userId: string, dto: CreateProjectDto) {
    const project = await prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: "OWNER"
          }
        }
      }
    });

    await createVersionRecord({
      projectId: project.id,
      entityType: "Project",
      entityId: project.id,
      changeType: "CREATED",
      changedById: userId,
      newValue: { name: project.name, description: project.description }
    });

    return project;
  },

  async listProjectsForUser(userId: string, userRole: UserRole) {
    if (userRole === "ADMIN") {
      return prisma.project.findMany({ orderBy: { updatedAt: "desc" } });
    }

    return prisma.project.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }]
      },
      orderBy: { updatedAt: "desc" }
    });
  },

  async getProjectById(projectId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new AppError("Project not found", "NOT_FOUND", 404);
    }
    return project;
  },

  async updateProject(projectId: string, userId: string, dto: UpdateProjectDto) {
    const current = await prisma.project.findUnique({ where: { id: projectId } });
    if (!current) {
      throw new AppError("Project not found", "NOT_FOUND", 404);
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        name: dto.name,
        description: dto.description
      }
    });

    await createVersionRecord({
      projectId,
      entityType: "Project",
      entityId: projectId,
      changeType: "UPDATED",
      changedById: userId,
      oldValue: { name: current.name, description: current.description },
      newValue: { name: updated.name, description: updated.description }
    });

    return updated;
  },

  async deleteProject(projectId: string, userId: string) {
    const current = await prisma.project.findUnique({ where: { id: projectId } });
    if (!current) {
      throw new AppError("Project not found", "NOT_FOUND", 404);
    }

    await prisma.project.delete({ where: { id: projectId } });

    await createVersionRecord({
      projectId,
      entityType: "Project",
      entityId: projectId,
      changeType: "DELETED",
      changedById: userId,
      oldValue: { name: current.name, description: current.description }
    });

    return { id: projectId };
  }
};
