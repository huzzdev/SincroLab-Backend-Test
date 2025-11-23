import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: 'therapist' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user with therapist role', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: createUserDto.email,
          password: createUserDto.password,
          role: 'therapist',
        },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const usersWithoutPassword = [
        {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
      ];
      mockPrismaService.user.findMany.mockResolvedValue(usersWithoutPassword);
      mockPrismaService.user.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10);

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual({
        data: usersWithoutPassword,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it('should handle pagination correctly', async () => {
      const usersWithoutPassword = [
        {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
      ];
      mockPrismaService.user.findMany.mockResolvedValue(usersWithoutPassword);
      mockPrismaService.user.count.mockResolvedValue(25);

      const result = await service.findAll(2, 10);

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        skip: 10,
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result.meta).toEqual({
        total: 25,
        page: 2,
        limit: 10,
        totalPages: 3,
      });
    });
  });

  describe('findById', () => {
    it('should return a user by id without password', async () => {
      const userWithoutPassword = {
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      };
      mockPrismaService.user.findUnique.mockResolvedValue(userWithoutPassword);

      const result = await service.findById('1');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          password: false,
        },
      });
      expect(result).toEqual(userWithoutPassword);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findById('999')).rejects.toThrow(NotFoundException);
      await expect(service.findById('999')).rejects.toThrow(
        'User with ID 999 not found',
      );
    });
  });

  describe('update', () => {
    it('should update a user without password', async () => {
      const updateUserDto = { email: 'updated@example.com' };
      const updatedUserWithoutPassword = {
        id: mockUser.id,
        email: 'updated@example.com',
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(
        updatedUserWithoutPassword,
      );

      const result = await service.update('1', updateUserDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { email: 'updated@example.com' },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          password: false,
        },
      });
      expect(result).toEqual(updatedUserWithoutPassword);
    });

    it('should hash password if provided in update', async () => {
      const updateUserDto = { password: 'newPassword123' };
      const hashedPassword = 'newHashedPassword';
      const updatedUserWithoutPassword = {
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(
        updatedUserWithoutPassword,
      );

      await service.update('1', updateUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(updateUserDto.password, 10);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { password: hashedPassword },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          password: false,
        },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.update('999', {})).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update('999', {})).rejects.toThrow(
        'User with ID 999 not found',
      );
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      await service.remove('1');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
      await expect(service.remove('999')).rejects.toThrow(
        'User with ID 999 not found',
      );
    });
  });
});
