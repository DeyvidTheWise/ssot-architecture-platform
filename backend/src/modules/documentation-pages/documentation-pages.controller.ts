import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../../types/request";
import { sendSuccess } from "../../utils/response";
import { documentationPagesService } from "./documentation-pages.service";

export const documentationPagesController = {
  async listProjectDocumentation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const docs = await documentationPagesService.listProjectDocumentation(req.params.projectId);
      sendSuccess(res, docs);
    } catch (error) {
      next(error);
    }
  },

  async getArtifactDocumentation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await documentationPagesService.getByArtifactId(req.params.artifactId);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  async upsertArtifactDocumentation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthenticatedRequest).user;
      const data = await documentationPagesService.upsertByArtifactId(req.params.artifactId, user!.sub, req.body);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }
};