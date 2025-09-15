import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
  HealthCheckResult,
} from '@nestjs/terminus';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;
  let httpHealthIndicator: HttpHealthIndicator;
  let typeOrmHealthIndicator: TypeOrmHealthIndicator;
  let configService: ConfigService;

  const mockHealthCheckService = {
    check: jest.fn(),
  };

  const mockHttpHealthIndicator = {
    pingCheck: jest.fn(),
  };

  const mockTypeOrmHealthIndicator = {
    pingCheck: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockHealthResult: HealthCheckResult = {
    status: 'ok',
    info: {
      docs: {
        status: 'up',
      },
    },
    error: {},
    details: {
      docs: {
        status: 'up',
      },
    },
  };

  const mockDbHealthResult: HealthCheckResult = {
    status: 'ok',
    info: {
      database: {
        status: 'up',
      },
    },
    error: {},
    details: {
      database: {
        status: 'up',
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: mockHealthCheckService,
        },
        {
          provide: HttpHealthIndicator,
          useValue: mockHttpHealthIndicator,
        },
        {
          provide: TypeOrmHealthIndicator,
          useValue: mockTypeOrmHealthIndicator,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    httpHealthIndicator = module.get<HttpHealthIndicator>(HttpHealthIndicator);
    typeOrmHealthIndicator = module.get<TypeOrmHealthIndicator>(
      TypeOrmHealthIndicator,
    );
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkHttp', () => {
    beforeEach(() => {
      mockConfigService.get.mockReturnValue(3333);
    });

    it('should return health check result for HTTP service', async () => {
      const mockPingCheck = jest.fn().mockResolvedValue({
        docs: { status: 'up' },
      });
      mockHttpHealthIndicator.pingCheck.mockImplementation(mockPingCheck);
      mockHealthCheckService.check.mockResolvedValue(mockHealthResult);

      const result = await controller.checkHttp();

      expect(healthCheckService.check).toHaveBeenCalledWith([
        expect.any(Function),
      ]);
      expect(result).toEqual(mockHealthResult);
    });

    it('should use default port when PORT is not configured', async () => {
      mockConfigService.get.mockReturnValue(undefined);
      const mockPingCheck = jest.fn().mockResolvedValue({
        docs: { status: 'up' },
      });
      mockHttpHealthIndicator.pingCheck.mockImplementation(mockPingCheck);
      mockHealthCheckService.check.mockResolvedValue(mockHealthResult);

      const result = await controller.checkHttp();

      expect(healthCheckService.check).toHaveBeenCalledWith([
        expect.any(Function),
      ]);
      expect(result).toEqual(mockHealthResult);
    });

    it('should handle HTTP health check failure', async () => {
      const errorResult: HealthCheckResult = {
        status: 'error',
        info: {},
        error: {
          docs: {
            status: 'down',
            message: 'Connection refused',
          },
        },
        details: {
          docs: {
            status: 'down',
            message: 'Connection refused',
          },
        },
      };
      mockHealthCheckService.check.mockResolvedValue(errorResult);

      const result = await controller.checkHttp();

      expect(healthCheckService.check).toHaveBeenCalledWith([
        expect.any(Function),
      ]);
      expect(result).toEqual(errorResult);
    });

    it('should handle health check service errors', async () => {
      const error = new Error('Health check failed');
      mockHealthCheckService.check.mockRejectedValue(error);

      await expect(controller.checkHttp()).rejects.toThrow(error);
      expect(healthCheckService.check).toHaveBeenCalledWith([
        expect.any(Function),
      ]);
    });

    it('should use custom port from configuration', async () => {
      const customPort = 8080;
      mockConfigService.get.mockReturnValue(customPort);
      const mockPingCheck = jest.fn().mockResolvedValue({
        docs: { status: 'up' },
      });
      mockHttpHealthIndicator.pingCheck.mockImplementation(mockPingCheck);
      mockHealthCheckService.check.mockResolvedValue(mockHealthResult);

      await controller.checkHttp();

      expect(configService.get).toHaveBeenCalledWith('PORT');
      expect(healthCheckService.check).toHaveBeenCalledWith([
        expect.any(Function),
      ]);
    });
  });

  describe('checkDb', () => {
    it('should return health check result for database', async () => {
      const mockPingCheck = jest.fn().mockResolvedValue({
        database: { status: 'up' },
      });
      mockTypeOrmHealthIndicator.pingCheck.mockImplementation(mockPingCheck);
      mockHealthCheckService.check.mockResolvedValue(mockDbHealthResult);

      const result = await controller.checkDb();

      expect(healthCheckService.check).toHaveBeenCalledWith([
        expect.any(Function),
      ]);
      expect(result).toEqual(mockDbHealthResult);
    });

    it('should handle database health check failure', async () => {
      const errorResult: HealthCheckResult = {
        status: 'error',
        info: {},
        error: {
          database: {
            status: 'down',
            message: 'Connection timeout',
          },
        },
        details: {
          database: {
            status: 'down',
            message: 'Connection timeout',
          },
        },
      };
      mockHealthCheckService.check.mockResolvedValue(errorResult);

      const result = await controller.checkDb();

      expect(healthCheckService.check).toHaveBeenCalledWith([
        expect.any(Function),
      ]);
      expect(result).toEqual(errorResult);
    });

    it('should handle database connection errors', async () => {
      const error = new Error('Database connection failed');
      mockHealthCheckService.check.mockRejectedValue(error);

      await expect(controller.checkDb()).rejects.toThrow(error);
      expect(healthCheckService.check).toHaveBeenCalledWith([
        expect.any(Function),
      ]);
    });

    it('should handle TypeORM health indicator errors', async () => {
      const mockPingCheck = jest
        .fn()
        .mockRejectedValue(new Error('Database unavailable'));
      mockTypeOrmHealthIndicator.pingCheck.mockImplementation(mockPingCheck);
      const error = new Error('Health check execution failed');
      mockHealthCheckService.check.mockRejectedValue(error);

      await expect(controller.checkDb()).rejects.toThrow(error);
      expect(healthCheckService.check).toHaveBeenCalledWith([
        expect.any(Function),
      ]);
    });

    it('should call TypeORM ping check with correct parameters', async () => {
      const mockPingCheck = jest.fn().mockResolvedValue({
        database: { status: 'up' },
      });
      mockTypeOrmHealthIndicator.pingCheck.mockImplementation(mockPingCheck);
      mockHealthCheckService.check.mockResolvedValue(mockDbHealthResult);

      await controller.checkDb();

      expect(healthCheckService.check).toHaveBeenCalledWith([
        expect.any(Function),
      ]);
    });
  });

  describe('constructor', () => {
    it('should initialize with default port when PORT is not set', () => {
      mockConfigService.get.mockReturnValue(undefined);

      const module = Test.createTestingModule({
        controllers: [HealthController],
        providers: [
          {
            provide: HealthCheckService,
            useValue: mockHealthCheckService,
          },
          {
            provide: HttpHealthIndicator,
            useValue: mockHttpHealthIndicator,
          },
          {
            provide: TypeOrmHealthIndicator,
            useValue: mockTypeOrmHealthIndicator,
          },
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      });

      expect(() => module.compile()).not.toThrow();
    });

    it('should initialize with custom port when PORT is set', () => {
      mockConfigService.get.mockReturnValue(8080);

      const module = Test.createTestingModule({
        controllers: [HealthController],
        providers: [
          {
            provide: HealthCheckService,
            useValue: mockHealthCheckService,
          },
          {
            provide: HttpHealthIndicator,
            useValue: mockHttpHealthIndicator,
          },
          {
            provide: TypeOrmHealthIndicator,
            useValue: mockTypeOrmHealthIndicator,
          },
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      });

      expect(() => module.compile()).not.toThrow();
    });
  });
});