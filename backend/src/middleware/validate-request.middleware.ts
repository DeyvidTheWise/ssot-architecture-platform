import { type NextFunction, type Request, type Response } from 'express';
import { type AnyZodObject } from 'zod';

export const validateRequest = (schema: AnyZodObject) => (req: Request, _res: Response, next: NextFunction): void => {
  schema.parse({
    body: req.body,
    params: req.params,
    query: req.query
  });
  next();
};
