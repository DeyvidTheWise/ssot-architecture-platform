import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../../types/request";
import { sendSuccess } from "../../utils/response";
import { diagramsService } from "./diagrams.service";

export const diagramsController = {
  async listProjectDiagrams(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const diagrams = await diagramsService.listProjectDiagrams(req.params.projectId);
      sendSuccess(res, diagrams);
    } catch (error) {
      next(error);
    }
  },

  async createDiagram(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthenticatedRequest).user;
      const diagram = await diagramsService.createDiagram(req.params.projectId, user!.sub, req.body);
      sendSuccess(res, diagram, "Operation successful", 201);
    } catch (error) {
      next(error);
    }
  },

  async getDiagramById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const diagram = await diagramsService.getDiagramById(req.params.diagramId);
      sendSuccess(res, diagram);
    } catch (error) {
      next(error);
    }
  },

  async updateDiagram(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthenticatedRequest).user;
      const diagram = await diagramsService.updateDiagram(req.params.diagramId, user!.sub, req.body);
      sendSuccess(res, diagram);
    } catch (error) {
      next(error);
    }
  },

  async deleteDiagram(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthenticatedRequest).user;
      const deleted = await diagramsService.deleteDiagram(req.params.diagramId, user!.sub);
      sendSuccess(res, deleted);
    } catch (error) {
      next(error);
    }
  }
};