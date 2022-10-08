import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('server.port');
  const prefix = configService.get<string>('server.prefix');
  app.setGlobalPrefix(prefix);
  app.use(cookieParser());
  /**make a dev mode and a production mode, different configuration for dev mode and production mode */
  app.enableCors({ credentials: true, origin: 'http://localhost:3000' });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(port);
};

bootstrap();
