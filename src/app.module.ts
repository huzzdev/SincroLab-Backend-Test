import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import environmentConfig from './config/environment';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [environmentConfig],
    }),
  ],
})
export class AppModule {}
