import type { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../utils/response";
import { graphsService } from "./graphs.service";

export const graphsController = {
  async getProjectGraph(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const graph = await graphsService.getProjectGraph(req.params.projectId);
      sendSuccess(res, graph);
    } catch (error) {
      next(error);
    }
  }
};