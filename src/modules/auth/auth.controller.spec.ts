import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
  };

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    roles: [{ name: 'user' }],
  };

  const mockLoginResponse = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    user: mockUser,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return login response when credentials are valid', async () => {
      mockAuthService.validateUser.mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(loginDto);

      expect(authService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockLoginResponse);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.login(loginDto)).rejects.toThrow(
        'Credenciais inválidas',
      );

      expect(authService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when validateUser throws error', async () => {
      mockAuthService.validateUser.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow();
      expect(authService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile from request', () => {
      const mockRequest = {
        user: mockUser,
      };

      const result = controller.getProfile(mockRequest);

      expect(result).toEqual(mockUser);
    });

    it('should return undefined when no user in request', () => {
      const mockRequest = {};

      const result = controller.getProfile(mockRequest);

      expect(result).toBeUndefined();
    });
  });

  describe('refresh', () => {
    const refreshToken = 'valid-refresh-token';
    const mockRefreshResponse = {
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
    };

    it('should return new tokens when refresh token is valid', async () => {
      mockAuthService.refreshToken.mockResolvedValue(mockRefreshResponse);

      const result = await controller.refresh(refreshToken);

      expect(authService.refreshToken).toHaveBeenCalledWith(refreshToken);
      expect(result).toEqual(mockRefreshResponse);
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      mockAuthService.refreshToken.mockRejectedValue(
        new Error('Invalid refresh token'),
      );

      await expect(controller.refresh(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.refresh(refreshToken)).rejects.toThrow(
        'Refresh token inválido ou expirado',
      );

      expect(authService.refreshToken).toHaveBeenCalledWith(refreshToken);
    });

    it('should throw UnauthorizedException when refresh token is expired', async () => {
      mockAuthService.refreshToken.mockRejectedValue(
        new Error('Token expired'),
      );

      await expect(controller.refresh(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.refreshToken).toHaveBeenCalledWith(refreshToken);
    });

    it('should handle empty refresh token', async () => {
      const emptyToken = '';
      mockAuthService.refreshToken.mockRejectedValue(
        new Error('Empty token'),
      );

      await expect(controller.refresh(emptyToken)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.refreshToken).toHaveBeenCalledWith(emptyToken);
    });
  });
});