import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDtoWithPatientId } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './entities/task.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { TaskStatus } from 'generated/prisma/enums';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  create(createTaskDtoWithPatientId: CreateTaskDtoWithPatientId) {
    if (!createTaskDtoWithPatientId.status) {
      createTaskDtoWithPatientId.status = TaskStatus.pending;
    }
    return this.prisma.task.create({ data: createTaskDtoWithPatientId });
  }

  findAll(patientId: TaskEntity['patientId'], page = 1, limit = 10) {
    const take = Math.max(1, Math.min(limit, 50));
    const skip = (Math.max(1, page) - 1) * take;

    return this.prisma.task.findMany({
      where: { patientId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: TaskEntity['id']) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async update(id: TaskEntity['id'], updateTaskDto: UpdateTaskDto) {
    const task = await this.findOne(id);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return this.prisma.task.update({ where: { id }, data: updateTaskDto });
  }

  async remove(id: TaskEntity['id']) {
    const task = await this.findOne(id);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return this.prisma.task.delete({ where: { id } });
  }
}
