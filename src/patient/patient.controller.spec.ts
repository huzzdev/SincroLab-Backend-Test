import { Test, TestingModule } from '@nestjs/testing';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientEntity } from './entities/patient.entity';

describe('PatientController', () => {
  let controller: PatientController;
  let patientService: jest.Mocked<PatientService>;

  const mockPatient: PatientEntity = {
    id: 'patient-id-123',
    fullName: 'John Doe',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockPatients: PatientEntity[] = [
    mockPatient,
    {
      id: 'patient-id-456',
      fullName: 'Jane Smith',
      createdAt: new Date('2025-01-02'),
      updatedAt: new Date('2025-01-02'),
    },
  ];

  beforeEach(async () => {
    const mockPatientService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientController],
      providers: [
        {
          provide: PatientService,
          useValue: mockPatientService,
        },
      ],
    }).compile();

    controller = module.get<PatientController>(PatientController);
    patientService = module.get(PatientService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new patient', async () => {
      const createPatientDto: CreatePatientDto = {
        fullName: 'John Doe',
      };

      patientService.create.mockResolvedValue(mockPatient);

      const result = await controller.create(createPatientDto);

      expect(patientService.create).toHaveBeenCalledWith(createPatientDto);
      expect(patientService.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockPatient);
    });

    it('should propagate errors from patient service', async () => {
      const createPatientDto: CreatePatientDto = {
        fullName: 'John Doe',
      };

      const error = new Error('Database error');
      patientService.create.mockRejectedValue(error);

      await expect(controller.create(createPatientDto)).rejects.toThrow(
        'Database error',
      );
      expect(patientService.create).toHaveBeenCalledWith(createPatientDto);
    });
  });

  describe('findAll', () => {
    it('should return all patients with default pagination', async () => {
      patientService.findAll.mockResolvedValue(mockPatients);

      const result = await controller.findAll();

      expect(patientService.findAll).toHaveBeenCalledWith(undefined, undefined);
      expect(result).toEqual(mockPatients);
    });

    it('should return all patients with custom pagination', async () => {
      patientService.findAll.mockResolvedValue(mockPatients);

      const result = await controller.findAll(2, 5);

      expect(patientService.findAll).toHaveBeenCalledWith(2, 5);
      expect(result).toEqual(mockPatients);
    });

    it('should handle page parameter only', async () => {
      patientService.findAll.mockResolvedValue(mockPatients);

      const result = await controller.findAll(3, undefined);

      expect(patientService.findAll).toHaveBeenCalledWith(3, undefined);
      expect(result).toEqual(mockPatients);
    });
  });

  describe('findOne', () => {
    it('should return a patient by id', async () => {
      patientService.findOne.mockResolvedValue(mockPatient);

      const result = await controller.findOne('patient-id-123');

      expect(patientService.findOne).toHaveBeenCalledWith('patient-id-123');
      expect(result).toEqual(mockPatient);
    });

    it('should propagate errors from patient service', async () => {
      const error = new Error('Patient not found');
      patientService.findOne.mockRejectedValue(error);

      await expect(controller.findOne('non-existent-id')).rejects.toThrow(
        'Patient not found',
      );
      expect(patientService.findOne).toHaveBeenCalledWith('non-existent-id');
    });
  });

  describe('update', () => {
    it('should update a patient', async () => {
      const updatePatientDto: UpdatePatientDto = {
        fullName: 'John Updated',
      };

      const updatedPatient = { ...mockPatient, fullName: 'John Updated' };
      patientService.update.mockResolvedValue(updatedPatient);

      const result = await controller.update(
        'patient-id-123',
        updatePatientDto,
      );

      expect(patientService.update).toHaveBeenCalledWith(
        'patient-id-123',
        updatePatientDto,
      );
      expect(result).toEqual(updatedPatient);
    });

    it('should propagate errors from patient service', async () => {
      const updatePatientDto: UpdatePatientDto = {
        fullName: 'John Updated',
      };

      const error = new Error('Patient not found');
      patientService.update.mockRejectedValue(error);

      await expect(
        controller.update('non-existent-id', updatePatientDto),
      ).rejects.toThrow('Patient not found');
      expect(patientService.update).toHaveBeenCalledWith(
        'non-existent-id',
        updatePatientDto,
      );
    });
  });

  describe('remove', () => {
    it('should delete a patient', async () => {
      patientService.remove.mockResolvedValue(mockPatient);

      const result = await controller.remove('patient-id-123');

      expect(patientService.remove).toHaveBeenCalledWith('patient-id-123');
      expect(result).toEqual(mockPatient);
    });

    it('should propagate errors from patient service', async () => {
      const error = new Error('Patient not found');
      patientService.remove.mockRejectedValue(error);

      await expect(controller.remove('non-existent-id')).rejects.toThrow(
        'Patient not found',
      );
      expect(patientService.remove).toHaveBeenCalledWith('non-existent-id');
    });
  });
});
