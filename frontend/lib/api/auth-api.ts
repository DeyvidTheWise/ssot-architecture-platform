import { apiClient } from "@/lib/api/client";
import type { UserDto } from "@/types/dto";

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResultDto {
  token: string;
  user: UserDto;
}

export const authApi = {
  register: (payload: RegisterPayload): Promise<AuthResultDto> => apiClient.post("/auth/register", payload),
  login: (payload: LoginPayload): Promise<AuthResultDto> => apiClient.post("/auth/login", payload),
  me: (): Promise<UserDto | null> => apiClient.get("/auth/me")
};