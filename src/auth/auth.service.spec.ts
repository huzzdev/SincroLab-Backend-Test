import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserEntity } from '../user/entity/user.entity';

// Mock bcrypt module
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: UserEntity = {
    id: 'user-id-123',
    email: 'test@example.com',
    password: 'hashedPassword123',
    role: 'therapist',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockCreateUserDto: CreateUserDto = {
    email: 'test@example.com',
    password: 'P@ssw0rd123',
  };

  beforeEach(async () => {
    const mockUserService = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      userService.findOne.mockResolvedValue(null);
      userService.create.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('mock-jwt-token');
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('mock-salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');

      const result = await service.register(mockCreateUserDto);

      expect(userService.findOne).toHaveBeenCalledWith({
        email: mockCreateUserDto.email,
      });
      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(
        mockCreateUserDto.password,
        'mock-salt',
      );
      expect(userService.create).toHaveBeenCalledWith({
        email: mockCreateUserDto.email,
        password: 'hashedPassword123',
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(result).toEqual({
        user: {
          sub: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        },
        access_token: 'mock-jwt-token',
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      userService.findOne.mockResolvedValue(mockUser);

      await expect(service.register(mockCreateUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(mockCreateUserDto)).rejects.toThrow(
        'User already exists',
      );
      expect(userService.findOne).toHaveBeenCalledWith({
        email: mockCreateUserDto.email,
      });
      expect(userService.create).not.toHaveBeenCalled();
    });
  });

  describe('signIn', () => {
    it('should sign in user with valid credentials', async () => {
      userService.findOne.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('mock-jwt-token');
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.signIn(mockCreateUserDto);

      expect(userService.findOne).toHaveBeenCalledWith({
        email: mockCreateUserDto.email,
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockCreateUserDto.password,
        mockUser.password,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(result).toEqual({
        user: {
          sub: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        },
        access_token: 'mock-jwt-token',
      });
    });

    it('should throw BadRequestException if user does not exist', async () => {
      userService.findOne.mockResolvedValue(null);

      await expect(service.signIn(mockCreateUserDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.signIn(mockCreateUserDto)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(userService.findOne).toHaveBeenCalledWith({
        email: mockCreateUserDto.email,
      });
    });

    it('should throw BadRequestException if password is incorrect', async () => {
      userService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.signIn(mockCreateUserDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.signIn(mockCreateUserDto)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(userService.findOne).toHaveBeenCalledWith({
        email: mockCreateUserDto.email,
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockCreateUserDto.password,
        mockUser.password,
      );
    });
  });

  describe('logout', () => {
    it('should add access token to revoked list', () => {
      const accessToken = 'mock-access-token';

      service.logout(accessToken);

      expect(service.isAccessTokenRevoked(accessToken)).toBe(true);
    });
  });

  describe('isAccessTokenRevoked', () => {
    it('should return true if access token is revoked', () => {
      const accessToken = 'revoked-token';
      service.logout(accessToken);

      const result = service.isAccessTokenRevoked(accessToken);

      expect(result).toBe(true);
    });

    it('should return false if access token is not revoked', () => {
      const accessToken = 'valid-token';

      const result = service.isAccessTokenRevoked(accessToken);

      expect(result).toBe(false);
    });
  });

  describe('getUserTokenPayload', () => {
    it('should return correct payload from user entity', () => {
      const result = service.getUserTokenPayload(mockUser);

      expect(result).toEqual({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });
  });

  describe('hashPassword', () => {
    it('should hash password correctly', async () => {
      const password = 'plainPassword123';
      const mockSalt = 'mock-salt';
      const mockHash = 'hashed-password';

      (bcrypt.genSalt as jest.Mock).mockResolvedValue(mockSalt);
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHash);

      const result = await service.hashPassword(password);

      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(password, mockSalt);
      expect(result).toBe(mockHash);
    });
  });

  describe('comparePassword', () => {
    it('should return true when passwords match', async () => {
      const password = 'plainPassword123';
      const hashedPassword = 'hashedPassword123';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.comparePassword(password, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false when passwords do not match', async () => {
      const password = 'plainPassword123';
      const hashedPassword = 'hashedPassword123';

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.comparePassword(password, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(false);
    });
  });
});
