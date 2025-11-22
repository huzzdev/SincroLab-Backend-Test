import { IsNotEmpty, IsString } from 'class-validator';
import { PatientEntity } from '../entities/patient.entity';

export class CreatePatientDto {
  @IsString()
  @IsNotEmpty({
    message: 'Full name is required',
  })
  fullName: PatientEntity['fullName'];
}
