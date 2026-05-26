import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../../types/request";
import { sendSuccess } from "../../utils/response";
import { artifactsService } from "./artifacts.service";

export const artifactsController = {
  async createArtifact(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthenticatedRequest).user;
      const artifact = await artifactsService.createArtifact(req.params.projectId, user!.sub, req.body);
      sendSuccess(res, artifact, "Operation successful", 201);
    } catch (error) {
      next(error);
    }
  },

  async listArtifacts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const artifacts = await artifactsService.listArtifacts(req.params.projectId, req.query as { type?: string; status?: string; q?: string });
      sendSuccess(res, artifacts);
    } catch (error) {
      next(error);
    }
  },

  async getArtifactById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const artifact = await artifactsService.getArtifactById(req.params.artifactId);
      sendSuccess(res, artifact);
    } catch (error) {
      next(error);
    }
  },

  async updateArtifact(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthenticatedRequest).user;
      const artifact = await artifactsService.updateArtifact(req.params.artifactId, user!.sub, req.body);
      sendSuccess(res, artifact);
    } catch (error) {
      next(error);
    }
  },

  async deleteArtifact(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthenticatedRequest).user;
      const deleted = await artifactsService.deleteArtifact(req.params.artifactId, user!.sub);
      sendSuccess(res, deleted);
    } catch (error) {
      next(error);
    }
  }
};