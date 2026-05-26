import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../../types/request";
import { sendSuccess } from "../../utils/response";
import { validationService } from "./validation.service";

export const validationController = {
  async runValidation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthenticatedRequest).user;
      const summary = await validationService.runValidation(req.params.projectId, user!.sub);
      sendSuccess(res, summary);
    } catch (error) {
      next(error);
    }
  },

  async listIssues(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const issues = await validationService.listIssues(req.params.projectId, req.query as { status?: string; severity?: string; category?: string });
      sendSuccess(res, issues);
    } catch (error) {
      next(error);
    }
  },

  async updateIssue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const issue = await validationService.updateIssue(req.params.issueId, req.body.status);
      sendSuccess(res, issue);
    } catch (error) {
      next(error);
    }
  }
};