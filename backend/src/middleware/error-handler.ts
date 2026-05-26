import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error";
import { sendError } from "../utils/response";

export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction): Response => {
  if (error instanceof ZodError) {
    const firstIssue = error.issues[0];
    return sendError(res, "VALIDATION_ERROR", firstIssue?.message ?? "Invalid input", 400);
  }

  if (error instanceof AppError) {
    return sendError(res, error.code, error.message, error.statusCode);
  }

  return sendError(res, "INTERNAL_ERROR", "Internal server error", 500);
};