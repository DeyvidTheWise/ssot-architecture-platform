import type { ProjectRole, UserRole } from "@prisma/client";
import type { Request } from "express";

export interface AuthenticatedUser {
  sub: string;
  role: UserRole;
  email: string;
}

export interface ProjectAccessContext {
  projectId: string;
  ownerId: string;
  membershipRole: ProjectRole | null;
  isAdmin: boolean;
  isOwner: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  projectAccess?: ProjectAccessContext;
}