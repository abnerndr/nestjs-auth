import { createZodDto } from 'nestjs-zod';
import { UserRoles } from 'src/shared/enums/roles.enum';
import { z } from 'zod';

const UpdateRoleSchema = z.object({
  name: z.enum(UserRoles).optional(),
  description: z.string().optional(),
  permissions: z.array(z.uuid('ID de permissão inválido')).optional(),
});

export class UpdateRoleDto extends createZodDto(UpdateRoleSchema) {}
