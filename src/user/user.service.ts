import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from './entity/user.entity';
import { Maybe } from 'src/common/types';
import { UserWhereUniqueInput } from 'generated/prisma/models';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<UserEntity> {
    return this.prisma.user.create({
      data: { ...data, role: 'therapist' },
    });
  }

  async findOne(filter: UserWhereUniqueInput): Promise<Maybe<UserEntity>> {
    return this.prisma.user.findUnique({
      where: filter,
    });
  }
}
