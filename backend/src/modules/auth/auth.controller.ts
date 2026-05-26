import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../../types/request";
import { sendSuccess } from "../../utils/response";
import { authService } from "./auth.service";

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      sendSuccess(res, result, "Operation successful", 201);
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  async me(req: Request, res: Response): Promise<void> {
    const user = (req as AuthenticatedRequest).user;
    sendSuccess(res, user ?? null);
  }
};