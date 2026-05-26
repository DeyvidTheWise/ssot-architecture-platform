import { prisma } from "../config/prisma";
import { emitToProject } from "../websocket/server";

interface VersionInput {
  projectId: string;
  entityType: string;
  entityId: string;
  changeType: "CREATED" | "UPDATED" | "DELETED" | "LINKED" | "UNLINKED" | "IMPORTED" | "VALIDATED" | "EXPORTED";
  changedById: string;
  oldValue?: object | null;
  newValue?: object | null;
}

export const createVersionRecord = async (input: VersionInput): Promise<void> => {
  const created = await prisma.versionHistory.create({
    data: {
      projectId: input.projectId,
      entityType: input.entityType,
      entityId: input.entityId,
      changeType: input.changeType,
      changedById: input.changedById,
      oldValue: input.oldValue ?? undefined,
      newValue: input.newValue ?? undefined
    }
  });

  emitToProject(input.projectId, "version:created", {
    id: created.id,
    entityType: created.entityType,
    entityId: created.entityId,
    changeType: created.changeType,
    createdAt: created.createdAt
  });
};
