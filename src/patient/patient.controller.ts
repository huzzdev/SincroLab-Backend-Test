import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientEntity } from './entities/patient.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('patient')
@Controller('patient')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Post()
  @ApiOperation({ summary: 'Create a new patient' })
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientService.create(createPatientDto);
  }

  @HttpCode(200)
  @Get()
  @ApiOperation({ summary: 'List patients with pagination' })
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
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.patientService.findAll(page, limit);
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
