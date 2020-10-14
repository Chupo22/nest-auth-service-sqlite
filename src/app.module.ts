import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserService, AuthService } from '@services';
import {
  ConfigModule,
  LoggerModule,
  ConfigService,
  LoggerService,
} from '@modules';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken, User } from '@entities';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    LoggerModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => config.typeOrmConfig,
    }),
    TypeOrmModule.forFeature([User, RefreshToken]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.env.JWT_SECRET,
          signOptions: { expiresIn: '60s' },
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AuthService,
    UserService,
    ConfigService,
    LoggerService,
    JwtStrategy,
  ],
})
export class AppModule {}
