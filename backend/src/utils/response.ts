import type { Response } from "express";

interface SuccessPayload<T> {
  success: true;
  data: T;
  message: string;
}

interface ErrorPayload {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export const sendSuccess = <T>(res: Response, data: T, message = "Operation successful", statusCode = 200): Response<SuccessPayload<T>> => {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  });
};

export const sendError = (res: Response, code: string, message: string, statusCode = 400): Response<ErrorPayload> => {
  return res.status(statusCode).json({
    success: false,
    error: { code, message }
  });
};