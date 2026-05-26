import type { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../utils/response";
import { versionHistoryService } from "./version-history.service";

export const versionHistoryController = {
  async listProjectVersions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const versions = await versionHistoryService.listProjectVersions(req.params.projectId, req.query as { entityType?: string; changeType?: string });
      sendSuccess(res, versions);
    } catch (error) {
      next(error);
    }
  },

  async listArtifactVersions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const versions = await versionHistoryService.listArtifactVersions(req.params.artifactId);
      sendSuccess(res, versions);
    } catch (error) {
      next(error);
    }
  }
};