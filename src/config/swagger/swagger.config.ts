import type { INestApplication } from '@nestjs/common/interfaces';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export class SwaggerConfig {
  static initialize<T>(app: INestApplication<T>) {
    const config = new DocumentBuilder()
      .setTitle('Sistema Clínico API')
      .setDescription(
        'API para sistema de controle de assinaturas e agendamentos',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }
}
