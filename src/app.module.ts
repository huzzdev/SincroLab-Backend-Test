import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { PatientModule } from './patient/patient.module';
import environmentConfig from './config/environment';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [environmentConfig],
    }),
    AuthModule,
    UserModule,
    PrismaModule,
    PatientModule,
  ],
})
export class AppModule {}
