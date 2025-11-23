import {
  Controller,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  UsePipes,
  ValidationPipe,
  Get,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './entities/task.entity';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('tasks')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @HttpCode(200)
  @Get(':id')
  @ApiOperation({ summary: 'Get a task by id' })
  findOne(@Param('id') id: TaskEntity['id']) {
    return this.taskService.findOne(id);
  }

  @UsePipes(new ValidationPipe({ whitelist: true }))
  @HttpCode(200)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  update(
    @Param('id') id: TaskEntity['id'],
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.taskService.update(id, updateTaskDto);
  }

  @HttpCode(204)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  remove(@Param('id') id: TaskEntity['id']) {
    return this.taskService.remove(id);
  }
}
