import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService, LoggerService } from '@modules';
import { createConnection } from 'typeorm';

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  // tslint:disable-next-line
  // type-coverage:ignore-next-line
  require('dotenv').config();
  // tslint:disable-next-line
  // type-coverage:ignore-next-line
  require('source-map-support').install();
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const logger = app.get(LoggerService);
  const host = config.env.HOST;
  const port = config.env.PORT;

  const connection = await createConnection(config.migrationsConfig);
  await connection.runMigrations();
  await connection.close();

  await app.listen(port, host);

  logger.log(`Listening on ${host}:${port}`, 'Bootstrap');
}

bootstrap();
