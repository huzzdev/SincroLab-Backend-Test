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
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientEntity } from './entities/patient.entity';

@Controller('patient')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Post()
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientService.create(createPatientDto);
  }

  @HttpCode(200)
  @Get()
  findAll() {
    return this.patientService.findAll();
  }

  @HttpCode(200)
  @Get(':id')
  findOne(@Param('id') id: PatientEntity['id']) {
    return this.patientService.findOne(id);
  }

  @UsePipes(new ValidationPipe({ whitelist: true }))
  @HttpCode(200)
  @Patch(':id')
  update(
    @Param('id') id: PatientEntity['id'],
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    return this.patientService.update(id, updatePatientDto);
  }

  @HttpCode(204)
  @Delete(':id')
  remove(@Param('id') id: PatientEntity['id']) {
    return this.patientService.remove(id);
  }
}
