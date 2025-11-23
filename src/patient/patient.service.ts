import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PatientEntity } from './entities/patient.entity';

@Injectable()
export class PatientService {
  constructor(private readonly prisma: PrismaService) {}

  create(createPatientDto: CreatePatientDto) {
    return this.prisma.patient.create({ data: createPatientDto });
  }

  findAll(page = 1, limit = 10) {
    const take = Math.max(1, Math.min(limit, 50));
    const skip = (Math.max(1, page) - 1) * take;

    return this.prisma.patient.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: PatientEntity['id']) {
    const patient = await this.prisma.patient.findUnique({ where: { id } });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    return patient;
  }

  async update(id: PatientEntity['id'], updatePatientDto: UpdatePatientDto) {
    const patient = await this.findOne(id);
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    return this.prisma.patient.update({
      where: { id },
      data: updatePatientDto,
    });
  }

  async remove(id: PatientEntity['id']) {
    const patient = await this.findOne(id);
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    return this.prisma.patient.delete({ where: { id } });
  }
}
