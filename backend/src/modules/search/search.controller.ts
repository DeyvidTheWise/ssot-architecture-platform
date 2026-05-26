import type { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../utils/response";
import { searchService } from "./search.service";

export const searchController = {
  async searchProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await searchService.searchProject(req.params.projectId, String(req.query.q));
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
};