import type { UserRoles } from '../enums/roles.enum';

export interface UserLoginInterface {
  email: string;
  full_name: string;
  id: string;
  role?: { name?: UserRoles };
}
