import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const ResponseLoginSchema = z.object({
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
});

export class ResponseLoginDto extends createZodDto(ResponseLoginSchema) {}
