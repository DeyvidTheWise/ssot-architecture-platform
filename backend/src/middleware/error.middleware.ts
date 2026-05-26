import { type NextFunction, type Request, type Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/app-error';
import { type ApiErrorResponse } from '../utils/api-response';

export const errorMiddleware = (error: unknown, _req: Request, res: Response<ApiErrorResponse>, _next: NextFunction): void => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message
      }
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.errors.map((issue) => issue.message).join('; ')
      }
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unexpected server error'
    }
  });
};
