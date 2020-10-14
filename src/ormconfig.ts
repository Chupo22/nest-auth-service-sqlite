import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService, LoggerService } from '@modules';

@Module({
  imports: [ConfigModule],
  providers: [ConfigService, LoggerService],
})
class OrmConfigModule {}

export = buildConfig();

async function buildConfig() {
  const app = await NestFactory.createApplicationContext(OrmConfigModule);

  const configService = app.get(ConfigService);
  const { migrationsConfig, seedsConfig } = configService;

  return [migrationsConfig, seedsConfig];
}
