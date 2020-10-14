import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@modules';
import { UserService } from '@services';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  @Inject()
  userService!: UserService;

  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.env.JWT_SECRET,
    });
  }

  async validate(payload: { id: string }) {
    const user = await this.userService.findById(payload.id);

    return !!user;
  }
}
