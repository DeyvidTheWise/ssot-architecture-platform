import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../../types/request";
import { sendSuccess } from "../../utils/response";
import { projectsService } from "./projects.service";

export const projectsController = {
  async createProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthenticatedRequest).user;
      const project = await projectsService.createProject(user!.sub, req.body);
      sendSuccess(res, project, "Operation successful", 201);
    } catch (error) {
      next(error);
    }
  },

  async listProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthenticatedRequest).user;
      const projects = await projectsService.listProjectsForUser(user!.sub, user!.role);
      sendSuccess(res, projects);
    } catch (error) {
      next(error);
    }
  },

  async getProjectById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = await projectsService.getProjectById(req.params.projectId);
      sendSuccess(res, project);
    } catch (error) {
      next(error);
    }
  },

  async updateProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthenticatedRequest).user;
      const project = await projectsService.updateProject(req.params.projectId, user!.sub, req.body);
      sendSuccess(res, project);
    } catch (error) {
      next(error);
    }
  },

  async deleteProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as AuthenticatedRequest).user;
      const deleted = await projectsService.deleteProject(req.params.projectId, user!.sub);
      sendSuccess(res, deleted);
    } catch (error) {
      next(error);
    }
  }
};