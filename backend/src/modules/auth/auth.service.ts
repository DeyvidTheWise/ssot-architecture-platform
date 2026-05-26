import { type AuthTokenDto, type AuthUserDto } from './auth.dto';

export class AuthService {
  async register(): Promise<AuthTokenDto> {
    throw new Error('Not implemented yet.');
  }

  async login(): Promise<AuthTokenDto> {
    throw new Error('Not implemented yet.');
  }

  async me(user: AuthUserDto): Promise<AuthUserDto> {
    return user;
  }
}

export const authService = new AuthService();
