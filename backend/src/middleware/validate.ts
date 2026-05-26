import type { NextFunction, Request, Response } from "express";
import { ZodError, type AnyZodObject } from "zod";
import { sendError } from "../utils/response";

export const validate = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const firstIssue = error.issues[0];
        sendError(res, "VALIDATION_ERROR", firstIssue?.message ?? "Invalid input", 400);
        return;
      }
      next(error);
    }
  };
};