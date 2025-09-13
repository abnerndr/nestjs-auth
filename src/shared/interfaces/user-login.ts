import type { UserRoles } from '../enums/roles.enum';

export interface UserLoginInterface {
  id: string;
  email: string;
  full_name: string;
  role?: { name?: UserRoles };
}

export interface JwtPayload {
  sub: string;
  email: string;
  full_name: string;
  role?: { name?: UserRoles };
}
