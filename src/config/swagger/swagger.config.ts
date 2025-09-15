import { INestApplication } from '@nestjs/common/interfaces';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

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
    // Configuração do Swagger UI tradicional
    SwaggerModule.setup('docs-swagger', app, document);
    // Configuração do Scalar (interface mais bonita)
    app.use(
      '/docs',
      apiReference({
        content: document,
        theme: 'default',
      }),
    );
  }
}
