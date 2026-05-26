import { type Request, type Response } from 'express';
import { authService } from './auth.service';
import { okResponse, type ApiSuccessResponse } from '../../utils/api-response';
import { type AuthTokenDto, type AuthUserDto } from './auth.dto';
import { AppError } from '../../utils/app-error';

export const register = async (_req: Request, res: Response<ApiSuccessResponse<AuthTokenDto>>): Promise<void> => {
  const result = await authService.register();
  res.status(201).json(okResponse(result, 'User registered successfully'));
};

export const login = async (_req: Request, res: Response<ApiSuccessResponse<AuthTokenDto>>): Promise<void> => {
  const result = await authService.login();
  res.status(200).json(okResponse(result, 'Login successful'));
};

export const me = async (req: Request, res: Response<ApiSuccessResponse<AuthUserDto>>): Promise<void> => {
  if (req.authUser == null) {
    throw new AppError('Authentication is required.', 401, 'UNAUTHORIZED');
  }

  const result = await authService.me({
    id: req.authUser.userId,
    email: req.authUser.email,
    firstName: '',
    lastName: '',
    role: req.authUser.role
  });
  res.status(200).json(okResponse(result));
};
