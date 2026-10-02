import { NestFactory } from '@nestjs/core';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { AppModule } from './app.module';

async function bootstrap() {
  if (existsSync('.env')) loadEnvFile('.env');
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  });
  app.enableShutdownHooks();
  await app.listen(process.env.PORT || 3000);
}
void bootstrap();
