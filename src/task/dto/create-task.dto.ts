import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { TaskEntity } from '../entities/task.entity';
import { Transform } from 'class-transformer';
import { TaskStatus } from 'generated/prisma/enums';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description: TaskEntity['description'];

  @IsOptional()
  @IsEnum(TaskStatus)
  status: TaskEntity['status'];

  @Transform(({ value }: { value: string }) => (value ? new Date(value) : null))
  @IsOptional()
  @IsDate()
  dueDate: TaskEntity['dueDate'];

  createdAt: TaskEntity['createdAt'];

  updatedAt: TaskEntity['updatedAt'];

  @IsNotEmpty()
  patientId: TaskEntity['patientId'];
}
