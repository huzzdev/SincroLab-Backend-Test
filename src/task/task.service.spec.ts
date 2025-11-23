import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateTaskDtoWithPatientId } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './entities/task.entity';
import { TaskStatus } from 'generated/prisma/enums';

describe('TaskService', () => {
  let service: TaskService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockTask: TaskEntity = {
    id: 'task-id-123',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.pending,
    dueDate: new Date('2025-12-31'),
    patientId: 'patient-id-123',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockTasks: TaskEntity[] = [
    mockTask,
    {
      id: 'task-id-456',
      title: 'Another Task',
      description: 'Another Description',
      status: TaskStatus.in_progress,
      dueDate: null,
      patientId: 'patient-id-123',
      createdAt: new Date('2025-01-02'),
      updatedAt: new Date('2025-01-02'),
    },
  ];

  beforeEach(async () => {
    const mockPrismaService = {
      task: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new task with provided status', async () => {
      const createTaskDto: CreateTaskDtoWithPatientId = {
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.in_progress,
        dueDate: new Date('2025-12-31'),
        patientId: 'patient-id-123',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };

      prismaService.task.create.mockResolvedValue(mockTask);

      const result = await service.create(createTaskDto);

      expect(prismaService.task.create).toHaveBeenCalledWith({
        data: createTaskDto,
      });
      expect(result).toEqual(mockTask);
    });

    it('should create a new task with default pending status when status is not provided', async () => {
      const createTaskDto: CreateTaskDtoWithPatientId = {
        title: 'Test Task',
        description: 'Test Description',
        dueDate: new Date('2025-12-31'),
        patientId: 'patient-id-123',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      } as CreateTaskDtoWithPatientId;

      prismaService.task.create.mockResolvedValue(mockTask);

      await service.create(createTaskDto);

      expect(createTaskDto.status).toBe(TaskStatus.pending);
      expect(prismaService.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: TaskStatus.pending,
        }),
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated tasks for a patient with default values', async () => {
      prismaService.task.findMany.mockResolvedValue(mockTasks);

      const result = await service.findAll('patient-id-123');

      expect(prismaService.task.findMany).toHaveBeenCalledWith({
        where: { patientId: 'patient-id-123' },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockTasks);
    });

    it('should return paginated tasks with custom page and limit', async () => {
      prismaService.task.findMany.mockResolvedValue(mockTasks);

      const result = await service.findAll('patient-id-123', 2, 5);

      expect(prismaService.task.findMany).toHaveBeenCalledWith({
        where: { patientId: 'patient-id-123' },
        skip: 5,
        take: 5,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockTasks);
    });

    it('should limit maximum page size to 50', async () => {
      prismaService.task.findMany.mockResolvedValue(mockTasks);

      await service.findAll('patient-id-123', 1, 100);

      expect(prismaService.task.findMany).toHaveBeenCalledWith({
        where: { patientId: 'patient-id-123' },
        skip: 0,
        take: 50,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should handle page number less than 1', async () => {
      prismaService.task.findMany.mockResolvedValue(mockTasks);

      await service.findAll('patient-id-123', 0, 10);

      expect(prismaService.task.findMany).toHaveBeenCalledWith({
        where: { patientId: 'patient-id-123' },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should handle limit less than 1', async () => {
      prismaService.task.findMany.mockResolvedValue(mockTasks);

      await service.findAll('patient-id-123', 1, 0);

      expect(prismaService.task.findMany).toHaveBeenCalledWith({
        where: { patientId: 'patient-id-123' },
        skip: 0,
        take: 1,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      prismaService.task.findUnique.mockResolvedValue(mockTask);

      const result = await service.findOne('task-id-123');

      expect(prismaService.task.findUnique).toHaveBeenCalledWith({
        where: { id: 'task-id-123' },
      });
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      prismaService.task.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        'Task not found',
      );
      expect(prismaService.task.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        status: TaskStatus.done,
      };

      const updatedTask = { ...mockTask, ...updateTaskDto };

      prismaService.task.findUnique.mockResolvedValue(mockTask);
      prismaService.task.update.mockResolvedValue(updatedTask);

      const result = await service.update('task-id-123', updateTaskDto);

      expect(prismaService.task.findUnique).toHaveBeenCalledWith({
        where: { id: 'task-id-123' },
      });
      expect(prismaService.task.update).toHaveBeenCalledWith({
        where: { id: 'task-id-123' },
        data: updateTaskDto,
      });
      expect(result).toEqual(updatedTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
      };

      prismaService.task.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', updateTaskDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update('non-existent-id', updateTaskDto),
      ).rejects.toThrow('Task not found');
      expect(prismaService.task.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a task', async () => {
      prismaService.task.findUnique.mockResolvedValue(mockTask);
      prismaService.task.delete.mockResolvedValue(mockTask);

      const result = await service.remove('task-id-123');

      expect(prismaService.task.findUnique).toHaveBeenCalledWith({
        where: { id: 'task-id-123' },
      });
      expect(prismaService.task.delete).toHaveBeenCalledWith({
        where: { id: 'task-id-123' },
      });
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      prismaService.task.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove('non-existent-id')).rejects.toThrow(
        'Task not found',
      );
      expect(prismaService.task.delete).not.toHaveBeenCalled();
    });
  });
});
