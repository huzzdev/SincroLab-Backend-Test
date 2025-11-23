import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './entities/task.entity';
import { TaskStatus } from 'generated/prisma/enums';

describe('TaskController', () => {
  let controller: TaskController;
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

  beforeEach(async () => {
    const mockTaskService = {
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: mockTaskService,
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
    taskService = module.get(TaskService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      taskService.findOne.mockResolvedValue(mockTask);

      const result = await controller.findOne('task-id-123');

      expect(taskService.findOne).toHaveBeenCalledWith('task-id-123');
      expect(result).toEqual(mockTask);
    });

    it('should propagate errors from task service', async () => {
      const error = new Error('Task not found');
      taskService.findOne.mockRejectedValue(error);

      await expect(controller.findOne('non-existent-id')).rejects.toThrow(
        'Task not found',
      );
      expect(taskService.findOne).toHaveBeenCalledWith('non-existent-id');
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        status: TaskStatus.done,
      };

      const updatedTask = { ...mockTask, ...updateTaskDto };
      taskService.update.mockResolvedValue(updatedTask);

      const result = await controller.update('task-id-123', updateTaskDto);

      expect(taskService.update).toHaveBeenCalledWith(
        'task-id-123',
        updateTaskDto,
      );
      expect(result).toEqual(updatedTask);
    });

    it('should propagate errors from task service', async () => {
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
      };

      const error = new Error('Task not found');
      taskService.update.mockRejectedValue(error);

      await expect(
        controller.update('non-existent-id', updateTaskDto),
      ).rejects.toThrow('Task not found');
      expect(taskService.update).toHaveBeenCalledWith(
        'non-existent-id',
        updateTaskDto,
      );
    });
  });

  describe('remove', () => {
    it('should delete a task', async () => {
      taskService.remove.mockResolvedValue(mockTask);

      const result = await controller.remove('task-id-123');

      expect(taskService.remove).toHaveBeenCalledWith('task-id-123');
      expect(result).toEqual(mockTask);
    });

    it('should propagate errors from task service', async () => {
      const error = new Error('Task not found');
      taskService.remove.mockRejectedValue(error);

      await expect(controller.remove('non-existent-id')).rejects.toThrow(
        'Task not found',
      );
      expect(taskService.remove).toHaveBeenCalledWith('non-existent-id');
    });
  });
});
