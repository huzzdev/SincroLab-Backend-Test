import { Test, TestingModule } from '@nestjs/testing';
import { PatientTaskController } from './patient-task.controller';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskEntity } from './entities/task.entity';
import { TaskStatus } from 'generated/prisma/enums';

describe('PatientTaskController', () => {
  let controller: PatientTaskController;
  let taskService: jest.Mocked<TaskService>;

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
    const mockTaskService = {
      create: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientTaskController],
      providers: [
        {
          provide: TaskService,
          useValue: mockTaskService,
        },
      ],
    }).compile();

    controller = module.get<PatientTaskController>(PatientTaskController);
    taskService = module.get(TaskService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a task for a patient', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.pending,
        dueDate: new Date('2025-12-31'),
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };

      taskService.create.mockResolvedValue(mockTask);

      const result = await controller.create(createTaskDto, 'patient-id-123');

      expect(taskService.create).toHaveBeenCalledWith({
        ...createTaskDto,
        patientId: 'patient-id-123',
      });
      expect(taskService.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTask);
    });

    it('should create a task with different patient id', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Another Task',
        description: 'Another Description',
        status: TaskStatus.in_progress,
        dueDate: null,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };

      const taskForDifferentPatient = {
        ...mockTask,
        patientId: 'patient-id-456',
      };
      taskService.create.mockResolvedValue(taskForDifferentPatient);

      const result = await controller.create(createTaskDto, 'patient-id-456');

      expect(taskService.create).toHaveBeenCalledWith({
        ...createTaskDto,
        patientId: 'patient-id-456',
      });
      expect(result).toEqual(taskForDifferentPatient);
    });

    it('should propagate errors from task service', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.pending,
        dueDate: new Date('2025-12-31'),
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };

      const error = new Error('Database error');
      taskService.create.mockRejectedValue(error);

      await expect(
        controller.create(createTaskDto, 'patient-id-123'),
      ).rejects.toThrow('Database error');
      expect(taskService.create).toHaveBeenCalledWith({
        ...createTaskDto,
        patientId: 'patient-id-123',
      });
    });
  });

  describe('findAll', () => {
    it('should return all tasks for a patient with default pagination', async () => {
      taskService.findAll.mockResolvedValue(mockTasks);

      const result = await controller.findAll('patient-id-123');

      expect(taskService.findAll).toHaveBeenCalledWith(
        'patient-id-123',
        undefined,
        undefined,
      );
      expect(result).toEqual(mockTasks);
    });

    it('should return all tasks for a patient with custom pagination', async () => {
      taskService.findAll.mockResolvedValue(mockTasks);

      const result = await controller.findAll('patient-id-123', 2, 5);

      expect(taskService.findAll).toHaveBeenCalledWith('patient-id-123', 2, 5);
      expect(result).toEqual(mockTasks);
    });

    it('should return tasks for different patient', async () => {
      taskService.findAll.mockResolvedValue([]);

      const result = await controller.findAll('patient-id-456', 1, 10);

      expect(taskService.findAll).toHaveBeenCalledWith('patient-id-456', 1, 10);
      expect(result).toEqual([]);
    });

    it('should handle page parameter only', async () => {
      taskService.findAll.mockResolvedValue(mockTasks);

      const result = await controller.findAll('patient-id-123', 3, undefined);

      expect(taskService.findAll).toHaveBeenCalledWith(
        'patient-id-123',
        3,
        undefined,
      );
      expect(result).toEqual(mockTasks);
    });
  });
});
