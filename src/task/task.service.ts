import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './entities/task.entity';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  create(createTaskDto: CreateTaskDto) {
    return this.prisma.task.create({ data: createTaskDto });
  }

  findAll() {
    return this.prisma.task.findMany();
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
