import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../../types/request";
import { sendSuccess } from "../../utils/response";
import { exportsService } from "./exports.service";

export const exportsController = {
  async createExport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthenticatedRequest).user;
      const exportPackage = await exportsService.createExport(req.params.projectId, user!.sub, req.body);
      sendSuccess(res, exportPackage, "Operation successful", 201);
    } catch (error) {
      next(error);
    }
  },

  async listProjectExports(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const exports = await exportsService.listProjectExports(req.params.projectId);
      sendSuccess(res, exports);
    } catch (error) {
      next(error);
    }
  },

  async getExportById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const exportPackage = await exportsService.getExportById(req.params.exportId);
      sendSuccess(res, exportPackage);
    } catch (error) {
      next(error);
    }
  }
};