import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/app-error";
import { createVersionRecord } from "../../utils/version-history";

export const projectMembersService = {
  async listMembers(projectId: string) {
    return prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: "asc" }
    });
  },

  async addMember(projectId: string, actorId: string, userId: string, role: "OWNER" | "ARCHITECT" | "DEVELOPER" | "VIEWER") {
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      throw new AppError("User not found", "NOT_FOUND", 404);
    }

    const existingMembership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } }
    });

    if (existingMembership) {
      throw new AppError("User is already a project member", "CONFLICT", 409);
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId,
        role
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    });

    await createVersionRecord({
      projectId,
      entityType: "ProjectMember",
      entityId: member.id,
      changeType: "CREATED",
      changedById: actorId,
      newValue: { userId: member.userId, role: member.role }
    });

    return member;
  },

  async removeMember(projectId: string, memberId: string, actorId: string) {
    const member = await prisma.projectMember.findFirst({
      where: {
        id: memberId,
        projectId
      }
    });

    if (!member) {
      throw new AppError("Project member not found", "NOT_FOUND", 404);
    }

    if (member.role === "OWNER") {
      throw new AppError("Cannot remove owner membership", "FORBIDDEN", 403);
    }

    await prisma.projectMember.delete({ where: { id: memberId } });

    await createVersionRecord({
      projectId,
      entityType: "ProjectMember",
      entityId: memberId,
      changeType: "DELETED",
      changedById: actorId,
      oldValue: { userId: member.userId, role: member.role }
    });

    return { id: memberId };
  }
};
