import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateUserSchema = z.object({
  full_name: z
    .string()
    .min(3, 'Nome completo deve ter pelo menos 3 caracteres'),
  email: z.email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  phone: z.string().optional(),
  document_number: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  role_id: z.uuid('ID de role inválido'),
  is_active: z.boolean().default(true),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
