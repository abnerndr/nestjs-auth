import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { HealthController } from '../src/health.controller';
import { HealthCheckService, HttpHealthIndicator, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn().mockResolvedValue({
              status: 'ok',
              info: { test: { status: 'up' } },
              error: {},
              details: { test: { status: 'up' } },
            }),
          },
        },
        {
          provide: HttpHealthIndicator,
          useValue: {
            pingCheck: jest.fn().mockResolvedValue({ test: { status: 'up' } }),
          },
        },
        {
          provide: TypeOrmHealthIndicator,
          useValue: {
            pingCheck: jest.fn().mockResolvedValue({ database: { status: 'up' } }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(3333),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/health/http (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/health/http');

    expect([200, 503]).toContain(response.status);
  });

  it('/health/db (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/health/db');

    expect([200, 503]).toContain(response.status);
  });

  it('deve ter o HealthController funcionando', () => {
    const healthController = app.get(HealthController);
    expect(healthController).toBeDefined();
  });
});
