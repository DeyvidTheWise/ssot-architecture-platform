import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { AuthenticatedUser } from "../types/request";

export interface JwtPayload extends AuthenticatedUser {}

export const signJwt = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
};

export const verifyJwt = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};