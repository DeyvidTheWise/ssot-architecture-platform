import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error";
import { verifyJwt } from "../utils/jwt";
import type { AuthenticatedRequest } from "../types/request";

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    next(new AppError("Authentication required", "UNAUTHORIZED", 401));
    return;
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    const payload = verifyJwt(token);
    (req as AuthenticatedRequest).user = payload;
    next();
  } catch {
    next(new AppError("Invalid or expired token", "UNAUTHORIZED", 401));
  }
};