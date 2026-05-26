import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../../types/request";
import { sendSuccess } from "../../utils/response";
import { relationsService } from "./relations.service";

export const relationsController = {
  async createRelation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthenticatedRequest).user;
      const relation = await relationsService.createRelation(req.params.artifactId, user!.sub, req.body);
      sendSuccess(res, relation, "Operation successful", 201);
    } catch (error) {
      next(error);
    }
  },

  async listRelations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const graphData = await relationsService.listRelationsForArtifact(req.params.artifactId);
      sendSuccess(res, graphData);
    } catch (error) {
      next(error);
    }
  },

  async deleteRelation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthenticatedRequest).user;
      const deleted = await relationsService.deleteRelation(req.params.relationId, user!.sub);
      sendSuccess(res, deleted);
    } catch (error) {
      next(error);
    }
  }
};