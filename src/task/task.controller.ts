import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './entities/task.entity';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto);
  }

  @HttpCode(200)
  @Get()
  findAll() {
    return this.taskService.findAll();
  }

  @HttpCode(200)
  @Get(':id')
  findOne(@Param('id') id: TaskEntity['id']) {
    return this.taskService.findOne(id);
  }

  @UsePipes(new ValidationPipe({ whitelist: true }))
  @HttpCode(200)
  @Patch(':id')
  update(
    @Param('id') id: TaskEntity['id'],
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.taskService.update(id, updateTaskDto);
  }

  @HttpCode(204)
  @Delete(':id')
  remove(@Param('id') id: TaskEntity['id']) {
    return this.taskService.remove(id);
  }
}
