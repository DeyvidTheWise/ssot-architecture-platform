import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../../types/request";
import { sendSuccess } from "../../utils/response";
import { apiSpecsService } from "./api-specs.service";

export const apiSpecsController = {
  async listProjectApiSpecs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const specs = await apiSpecsService.listProjectApiSpecs(req.params.projectId);
      sendSuccess(res, specs);
    } catch (error) {
      next(error);
    }
  },

  async importApiSpec(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthenticatedRequest).user;
      const imported = await apiSpecsService.importApiSpec(req.params.projectId, user!.sub, req.body);
      sendSuccess(res, imported, "Operation successful", 201);
    } catch (error) {
      next(error);
    }
  },

  async getApiSpecById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const spec = await apiSpecsService.getApiSpecById(req.params.apiSpecId);
      sendSuccess(res, spec);
    } catch (error) {
      next(error);
    }
  },

  async deleteApiSpec(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthenticatedRequest).user;
      const deleted = await apiSpecsService.deleteApiSpec(req.params.apiSpecId, user!.sub);
      sendSuccess(res, deleted);
    } catch (error) {
      next(error);
    }
  }
};