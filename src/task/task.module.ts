import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PatientTaskController } from './patient-task.controller';

@Module({
  controllers: [TaskController, PatientTaskController],
  providers: [TaskService],
  imports: [PrismaModule],
})
export class TaskModule {}
