import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreatePermissionSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
});

export class CreatePermissionDto extends createZodDto(CreatePermissionSchema) {}
