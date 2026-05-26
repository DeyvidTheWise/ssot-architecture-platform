export interface AuthUserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'ARCHITECT' | 'DEVELOPER' | 'VIEWER';
}

export interface AuthTokenDto {
  token: string;
  user: AuthUserDto;
}
