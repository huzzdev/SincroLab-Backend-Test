import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from 'generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private readonly configService: ConfigService) {
    const url = configService.get<string>('DATABASE.URL');
    const adapter = new PrismaBetterSqlite3({
      url,
    });
    super({ adapter });
  }
}
