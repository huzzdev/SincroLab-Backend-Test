import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get<string>('CLIENT_URL'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Sincrolab Test')
    .setDescription('Sincrolab Test API description')
    .setVersion('1.0')
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(configService.get('PORT')!);
}

void bootstrap();
