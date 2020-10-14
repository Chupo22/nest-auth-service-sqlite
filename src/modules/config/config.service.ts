import { Injectable } from '@nestjs/common';

import {
  IsIn,
  IsString,
  IsNotEmpty,
  validateSync,
  IsNumber,
} from 'class-validator';
import { plainToClass, Transform } from 'class-transformer';

import { LoggerService } from '@modules';
import { join } from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';

class EnvDTO {
  @IsString()
  @IsIn(['development', 'production', 'test'])
  @IsNotEmpty()
  NODE_ENV!: 'development' | 'production' | 'test';

  @IsString()
  @IsNotEmpty()
  HOST!: string;

  @IsNumber()
  @IsNotEmpty()
  @Transform((v: string) => +v)
  PORT!: number;

  @IsString()
  @IsIn(['ALL', 'NONE', 'ERROR'])
  LOG_LEVEL!: 'ALL' | 'NONE' | 'ERROR';

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;
}

@Injectable()
export class ConfigService {
  env: EnvDTO;

  constructor(private readonly logger: LoggerService) {
    const env = plainToClass(EnvDTO, process.env, { strategy: 'exposeAll' });
    const errors = validateSync(
      plainToClass(EnvDTO, process.env, { strategy: 'exposeAll' }),
    );

    if (errors?.length) {
      this.logger.error(errors);
      throw new Error('Env validation error');
    }

    this.env = env;
  }

  get typeOrmConfig(): SqliteConnectionOptions {
    return {
      type: 'sqlite',

      database: join(__dirname, '../../../db.sqlite'),

      entities: [join(__dirname, join('../../**/*.entity.{ts,js}'))],
      namingStrategy: new SnakeNamingStrategy(),

      // Так уж сделали в api typeorm ¯\_(ツ)_/¯
      logging: (() => {
        switch (this.env.LOG_LEVEL) {
          case 'ALL':
            return 'all';
          case 'ERROR':
            return ['error'] as 'error'[];
          case 'NONE':
            return false;
        }
      })(),
    };
  }

  get migrationsConfig(): SqliteConnectionOptions {
    const config = this.typeOrmConfig;

    return {
      ...config,

      name: 'migrations',
      migrationsTableName: 'auth_migrations',
      migrations: [
        join(__dirname, '../../migrations/*'),
        join(__dirname, 'seeds/*'),
      ],
      cli: { migrationsDir: 'src/migrations' },
    };
  }

  get seedsConfig(): SqliteConnectionOptions {
    return {
      ...this.migrationsConfig,
      name: 'seeds',
      cli: { migrationsDir: 'src/seeds' },
    };
  }

  get testsMigrationsConfig() {
    return {
      ...this.migrationsConfig,
      migrations: [join(__dirname, '../../migrations/*')],
    };
  }
}
