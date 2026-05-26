import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../../types/request";
import { sendSuccess } from "../../utils/response";
import { projectMembersService } from "./project-members.service";

export const projectMembersController = {
  async listMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const members = await projectMembersService.listMembers(req.params.projectId);
      sendSuccess(res, members);
    } catch (error) {
      next(error);
    }
  },

  async addMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthenticatedRequest).user;
      const member = await projectMembersService.addMember(req.params.projectId, user!.sub, req.body.userId, req.body.role);
      sendSuccess(res, member, "Operation successful", 201);
    } catch (error) {
      next(error);
    }
  },

  async removeMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthenticatedRequest).user;
      const deleted = await projectMembersService.removeMember(req.params.projectId, req.params.memberId, user!.sub);
      sendSuccess(res, deleted);
    } catch (error) {
      next(error);
    }
  }
};