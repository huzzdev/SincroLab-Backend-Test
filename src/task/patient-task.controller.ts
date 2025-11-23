import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskEntity } from './entities/task.entity';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('tasks')
@Controller('patient/:id/tasks')
export class PatientTaskController {
  constructor(private readonly taskService: TaskService) {}

  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Post()
  @ApiOperation({ summary: 'Create a task for a patient' })
  create(
    @Body() createTaskDto: CreateTaskDto,
    @Param('id') patientId: TaskEntity['patientId'],
  ) {
    return this.taskService.create({ ...createTaskDto, patientId });
  }

  @HttpCode(200)
  @Get()
  @ApiOperation({ summary: 'List tasks for a patient with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number (1-based)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Page size',
  })
  findAll(
    @Param('id') patientId: TaskEntity['patientId'],
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.taskService.findAll(patientId, page, limit);
  }
}
