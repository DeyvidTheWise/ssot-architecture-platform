import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../../types/request";
import { sendSuccess } from "../../utils/response";
import { apiEndpointsService } from "./api-endpoints.service";

export const apiEndpointsController = {
  async listApiSpecEndpoints(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const endpoints = await apiEndpointsService.listApiSpecEndpoints(req.params.apiSpecId);
      sendSuccess(res, endpoints);
    } catch (error) {
      next(error);
    }
  },

  async linkEndpointToArtifact(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthenticatedRequest).user;
      const updated = await apiEndpointsService.linkEndpointToArtifact(req.params.apiEndpointId, user!.sub, req.body.artifactId);
      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  }
};