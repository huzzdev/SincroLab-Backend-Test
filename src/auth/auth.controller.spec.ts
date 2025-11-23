import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockCreateUserDto: CreateUserDto = {
    email: 'test@example.com',
    password: 'P@ssw0rd123',
  };

  const mockAuthResponse = {
    user: {
      sub: 'user-id-123',
      email: 'test@example.com',
      role: 'therapist' as const,
    },
    access_token: 'mock-jwt-token',
  };

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      signIn: jest.fn(),
      logout: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      verifyAsync: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: AuthGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      authService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(mockCreateUserDto);

      expect(authService.register).toHaveBeenCalledWith(mockCreateUserDto);
      expect(authService.register).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should propagate errors from auth service', async () => {
      const error = new Error('Registration failed');
      authService.register.mockRejectedValue(error);

      await expect(controller.register(mockCreateUserDto)).rejects.toThrow(
        'Registration failed',
      );
      expect(authService.register).toHaveBeenCalledWith(mockCreateUserDto);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      authService.signIn.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(mockCreateUserDto);

      expect(authService.signIn).toHaveBeenCalledWith(mockCreateUserDto);
      expect(authService.signIn).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should propagate errors from auth service', async () => {
      const error = new Error('Invalid credentials');
      authService.signIn.mockRejectedValue(error);

      await expect(controller.login(mockCreateUserDto)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(authService.signIn).toHaveBeenCalledWith(mockCreateUserDto);
    });
  });

  describe('me', () => {
    it('should return current user from request', () => {
      const mockRequest = {
        user: {
          sub: 'user-id-123',
          email: 'test@example.com',
          role: 'therapist' as const,
        },
        token: 'mock-access-token',
      };

      const result = controller.me(mockRequest);

      expect(result).toEqual(mockRequest.user);
    });

    it('should return user with different role', () => {
      const mockRequest = {
        user: {
          sub: 'user-id-456',
          email: 'admin@example.com',
          role: 'admin' as const,
        },
        token: 'mock-admin-token',
      };

      const result = controller.me(mockRequest);

      expect(result).toEqual(mockRequest.user);
    });
  });

  describe('logout', () => {
    it('should logout user successfully', () => {
      const mockRequest = { token: 'mock-access-token' };
      authService.logout.mockReturnValue(undefined);

      const result = controller.logout(mockRequest);

      expect(authService.logout).toHaveBeenCalledWith('mock-access-token');
      expect(authService.logout).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should handle logout with different tokens', () => {
      const mockRequest = { token: 'different-token-456' };
      authService.logout.mockReturnValue(undefined);

      controller.logout(mockRequest);

      expect(authService.logout).toHaveBeenCalledWith('different-token-456');
    });
  });
});
