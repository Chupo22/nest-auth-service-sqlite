import { Injectable, Inject, HttpException } from '@nestjs/common';
import { LoginRequestDTO, RefreshRequestDTO, LogoutRequestDTO } from '@dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuid } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { User, RefreshToken } from '@entities';
import { Repository, getConnection, EntityManager } from 'typeorm';

@Injectable()
export class AuthService {
  @InjectRepository(User)
  userRepository!: Repository<User>;

  @InjectRepository(RefreshToken)
  refreshTokenRepository!: Repository<RefreshToken>;

  @Inject()
  jwtService!: JwtService;

  async login(args: LoginRequestDTO) {
    const { login, password } = args;
    const user = await this.userRepository.findOne({ email: login });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new HttpException('Invalid credentials', 403);
    }

    return this.issueTokenPair(user.id);
  }

  async refresh(args: RefreshRequestDTO) {
    const { refreshToken } = args;
    const token = await this.refreshTokenRepository.findOne({ refreshToken });

    if (!token) {
      throw new HttpException('Invalid refresh token', 404);
    }

    return getConnection().transaction(async (manager: EntityManager) => {
      const repo = manager.getRepository(RefreshToken);

      await repo.remove(token);

      return this.issueTokenPair(token.userId, manager);
    });
  }

  async logout(args: LogoutRequestDTO) {
    return this.refreshTokenRepository.delete({ userId: args.userId });
  }

  async issueTokenPair(
    userId: string,
    manager: EntityManager = getConnection().manager,
  ) {
    const refreshToken = uuid();
    const repo = manager.getRepository(RefreshToken);

    await repo.insert({ refreshToken, userId });

    return {
      token: this.jwtService.sign({ id: userId }),
      refreshToken,
    };
  }
}
