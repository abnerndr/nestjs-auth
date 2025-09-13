import { Logger } from '@nestjs/common/services/logger.service';
import { NestFactory } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module';
import { SwaggerConfig } from './config/swagger/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Configuração do CORS
  app.enableCors();
  // Configuração do Swagger
  SwaggerConfig.initialize(app);
  // Configuração de validação global
  app.useGlobalPipes(new ZodValidationPipe());
  await app.listen(process.env.PORT ?? 3000, async () => {
    Logger.debug(`Application is running on: ${await app.getUrl()}`);
    Logger.debug(`Swagger is running on: ${await app.getUrl()}/docs`);
  });
}
bootstrap();
