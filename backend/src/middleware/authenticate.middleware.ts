import { type NextFunction, type Request, type Response } from 'express';
import { AppError } from '../utils/app-error';
import { verifyAccessToken, type JwtPayload } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      authUser?: JwtPayload;
    }
  }
}

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader?.startsWith('Bearer ')) {
    throw new AppError('Authentication is required.', 401, 'UNAUTHORIZED');
  }

  const token = authorizationHeader.replace('Bearer ', '');
  req.authUser = verifyAccessToken(token);
  next();
};
