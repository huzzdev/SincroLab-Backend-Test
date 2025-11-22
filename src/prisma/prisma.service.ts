import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from 'generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private readonly configService: ConfigService) {
    const url = configService.get<string>('DATABASE.URL')!;
    const adapter = new PrismaLibSql({
      url,
    });
    super({ adapter });
  }
}
