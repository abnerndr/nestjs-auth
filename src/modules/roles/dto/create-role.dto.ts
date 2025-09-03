import { createZodDto } from 'nestjs-zod';
import { UserRoles } from 'src/shared/enums/roles.enum';
import { z } from 'zod';

const CreateRoleSchema = z.object({
  name: z
    .enum(UserRoles)
    .refine((val) => Object.values(UserRoles).includes(val), {
      message: 'Nome de role inválido',
      path: ['name'],
    }),
  description: z.string().optional(),
  permissions: z.array(z.uuid('ID de permissão inválido')).optional(),
});

export class CreateRoleDto extends createZodDto(CreateRoleSchema) {}
