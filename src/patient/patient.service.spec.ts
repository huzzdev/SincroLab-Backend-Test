import { Test, TestingModule } from '@nestjs/testing';
import { PatientService } from './patient.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientEntity } from './entities/patient.entity';

describe('PatientService', () => {
  let service: PatientService;
  let prismaService: jest.Mocked<PrismaService>;

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
    const mockPrismaService = {
      patient: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PatientService>(PatientService);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new patient', async () => {
      const createPatientDto: CreatePatientDto = {
        fullName: 'John Doe',
      };

      prismaService.patient.create.mockResolvedValue(mockPatient);

      const result = await service.create(createPatientDto);

      expect(prismaService.patient.create).toHaveBeenCalledWith({
        data: createPatientDto,
      });
      expect(prismaService.patient.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockPatient);
    });
  });

  describe('findAll', () => {
    it('should return paginated patients with default values', async () => {
      prismaService.patient.findMany.mockResolvedValue(mockPatients);

      const result = await service.findAll();

      expect(prismaService.patient.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockPatients);
    });

    it('should return paginated patients with custom page and limit', async () => {
      prismaService.patient.findMany.mockResolvedValue(mockPatients);

      const result = await service.findAll(2, 5);

      expect(prismaService.patient.findMany).toHaveBeenCalledWith({
        skip: 5,
        take: 5,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockPatients);
    });

    it('should limit maximum page size to 50', async () => {
      prismaService.patient.findMany.mockResolvedValue(mockPatients);

      await service.findAll(1, 100);

      expect(prismaService.patient.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 50,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should handle page number less than 1', async () => {
      prismaService.patient.findMany.mockResolvedValue(mockPatients);

      await service.findAll(0, 10);

      expect(prismaService.patient.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should handle limit less than 1', async () => {
      prismaService.patient.findMany.mockResolvedValue(mockPatients);

      await service.findAll(1, 0);

      expect(prismaService.patient.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 1,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a patient by id', async () => {
      prismaService.patient.findUnique.mockResolvedValue(mockPatient);

      const result = await service.findOne('patient-id-123');

      expect(prismaService.patient.findUnique).toHaveBeenCalledWith({
        where: { id: 'patient-id-123' },
      });
      expect(result).toEqual(mockPatient);
    });

    it('should throw NotFoundException if patient not found', async () => {
      prismaService.patient.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        'Patient not found',
      );
      expect(prismaService.patient.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
    });
  });

  describe('update', () => {
    it('should update a patient', async () => {
      const updatePatientDto: UpdatePatientDto = {
        fullName: 'John Updated',
      };

      const updatedPatient = { ...mockPatient, fullName: 'John Updated' };

      prismaService.patient.findUnique.mockResolvedValue(mockPatient);
      prismaService.patient.update.mockResolvedValue(updatedPatient);

      const result = await service.update('patient-id-123', updatePatientDto);

      expect(prismaService.patient.findUnique).toHaveBeenCalledWith({
        where: { id: 'patient-id-123' },
      });
      expect(prismaService.patient.update).toHaveBeenCalledWith({
        where: { id: 'patient-id-123' },
        data: updatePatientDto,
      });
      expect(result).toEqual(updatedPatient);
    });

    it('should throw NotFoundException if patient not found', async () => {
      const updatePatientDto: UpdatePatientDto = {
        fullName: 'John Updated',
      };

      prismaService.patient.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', updatePatientDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update('non-existent-id', updatePatientDto),
      ).rejects.toThrow('Patient not found');
      expect(prismaService.patient.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a patient', async () => {
      prismaService.patient.findUnique.mockResolvedValue(mockPatient);
      prismaService.patient.delete.mockResolvedValue(mockPatient);

      const result = await service.remove('patient-id-123');

      expect(prismaService.patient.findUnique).toHaveBeenCalledWith({
        where: { id: 'patient-id-123' },
      });
      expect(prismaService.patient.delete).toHaveBeenCalledWith({
        where: { id: 'patient-id-123' },
      });
      expect(result).toEqual(mockPatient);
    });

    it('should throw NotFoundException if patient not found', async () => {
      prismaService.patient.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove('non-existent-id')).rejects.toThrow(
        'Patient not found',
      );
      expect(prismaService.patient.delete).not.toHaveBeenCalled();
    });
  });
});
