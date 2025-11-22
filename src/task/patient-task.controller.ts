import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskEntity } from './entities/task.entity';

@Controller('patient/:id/tasks')
export class PatientTaskController {
  constructor(private readonly taskService: TaskService) {}

  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Post()
  create(
    @Body() createTaskDto: CreateTaskDto,
    @Param('id') patientId: TaskEntity['patientId'],
  ) {
    return this.taskService.create({ ...createTaskDto, patientId });
  }

  @HttpCode(200)
  @Get()
  findAll(@Param('id') patientId: TaskEntity['patientId']) {
    return this.taskService.findAll(patientId);
  }
}
