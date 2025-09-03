import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const UpdatePermissionSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').optional(),
  description: z.string().optional(),
});

export class UpdatePermissionDto extends createZodDto(UpdatePermissionSchema) {}
