import type { ProjectRole } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import type { AuthenticatedRequest, ProjectAccessContext } from "../types/request";
import { AppError } from "../utils/app-error";

type Permission = "project:read" | "project:update" | "project:delete" | "members:manage" | "artifact:write" | "artifact:delete" | "relation:write";

const permissionRoles: Record<Permission, ProjectRole[]> = {
  "project:read": ["OWNER", "ARCHITECT", "DEVELOPER", "VIEWER"],
  "project:update": ["OWNER", "ARCHITECT"],
  "project:delete": ["OWNER"],
  "members:manage": ["OWNER"],
  "artifact:write": ["OWNER", "ARCHITECT", "DEVELOPER"],
  "artifact:delete": ["OWNER", "ARCHITECT"],
  "relation:write": ["OWNER", "ARCHITECT", "DEVELOPER"]
};

const getUserId = (req: AuthenticatedRequest): string => {
  if (!req.user?.sub) {
    throw new AppError("Authentication required", "UNAUTHORIZED", 401);
  }
  return req.user.sub;
};

const buildAccessContext = async (projectId: string, req: AuthenticatedRequest): Promise<ProjectAccessContext> => {
  const userId = getUserId(req);
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    throw new AppError("Project not found", "NOT_FOUND", 404);
  }

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } }
  });

  const isAdmin = req.user?.role === "ADMIN";
  const isOwner = project.ownerId === userId;

  if (!isAdmin && !isOwner && !membership) {
    throw new AppError("Project access denied", "FORBIDDEN", 403);
  }

  return {
    projectId,
    ownerId: project.ownerId,
    membershipRole: membership?.role ?? null,
    isAdmin: Boolean(isAdmin),
    isOwner
  };
};

const canPerform = (permission: Permission, access: ProjectAccessContext): boolean => {
  if (access.isAdmin || access.isOwner) {
    return true;
  }

  if (!access.membershipRole) {
    return false;
  }

  return permissionRoles[permission].includes(access.membershipRole);
};

export const withProjectAccessFromProjectParam = () => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const typedReq = req as AuthenticatedRequest;
      typedReq.projectAccess = await buildAccessContext(req.params.projectId, typedReq);
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const withProjectAccessFromArtifactParam = () => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const artifact = await prisma.artifact.findUnique({ where: { id: req.params.artifactId } });
      if (!artifact) {
        throw new AppError("Artifact not found", "NOT_FOUND", 404);
      }

      const typedReq = req as AuthenticatedRequest;
      typedReq.projectAccess = await buildAccessContext(artifact.projectId, typedReq);
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const withProjectAccessFromRelationParam = () => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const relation = await prisma.artifactRelation.findUnique({ where: { id: req.params.relationId } });
      if (!relation) {
        throw new AppError("Relation not found", "NOT_FOUND", 404);
      }

      const typedReq = req as AuthenticatedRequest;
      typedReq.projectAccess = await buildAccessContext(relation.projectId, typedReq);
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const withProjectAccessFromApiSpecParam = () => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const apiSpec = await prisma.apiSpec.findUnique({ where: { id: req.params.apiSpecId } });
      if (!apiSpec) {
        throw new AppError("API spec not found", "NOT_FOUND", 404);
      }

      const typedReq = req as AuthenticatedRequest;
      typedReq.projectAccess = await buildAccessContext(apiSpec.projectId, typedReq);
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const withProjectAccessFromApiEndpointParam = () => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const endpoint = await prisma.apiEndpoint.findUnique({
        where: { id: req.params.apiEndpointId },
        include: { apiSpec: { select: { projectId: true } } }
      });
      if (!endpoint) {
        throw new AppError("API endpoint not found", "NOT_FOUND", 404);
      }

      const typedReq = req as AuthenticatedRequest;
      typedReq.projectAccess = await buildAccessContext(endpoint.apiSpec.projectId, typedReq);
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const withProjectAccessFromDiagramParam = () => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const diagram = await prisma.diagram.findUnique({ where: { id: req.params.diagramId } });
      if (!diagram) {
        throw new AppError("Diagram not found", "NOT_FOUND", 404);
      }

      const typedReq = req as AuthenticatedRequest;
      typedReq.projectAccess = await buildAccessContext(diagram.projectId, typedReq);
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const withProjectAccessFromValidationIssueParam = () => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const issue = await prisma.validationIssue.findUnique({ where: { id: req.params.issueId } });
      if (!issue) {
        throw new AppError("Validation issue not found", "NOT_FOUND", 404);
      }

      const typedReq = req as AuthenticatedRequest;
      typedReq.projectAccess = await buildAccessContext(issue.projectId, typedReq);
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const withProjectAccessFromExportParam = () => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const exportPackage = await prisma.exportPackage.findUnique({ where: { id: req.params.exportId } });
      if (!exportPackage) {
        throw new AppError("Export package not found", "NOT_FOUND", 404);
      }

      const typedReq = req as AuthenticatedRequest;
      typedReq.projectAccess = await buildAccessContext(exportPackage.projectId, typedReq);
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireProjectPermission = (permission: Permission) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const typedReq = req as AuthenticatedRequest;
      const access = typedReq.projectAccess;

      if (!access) {
        throw new AppError("Missing project access context", "INTERNAL_ERROR", 500);
      }

      if (!canPerform(permission, access)) {
        throw new AppError("Insufficient project permissions", "FORBIDDEN", 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
