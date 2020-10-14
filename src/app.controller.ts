import {
  Controller,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  HttpCode,
  Post,
  UseGuards,
  Inject,
  Body,
} from '@nestjs/common';
import { LoggingInterceptor } from '@interceptors';
import { LoginRequestDTO, RefreshRequestDTO, LogoutRequestDTO } from '@dto';
import { JwtAuthGuard } from '@auth-guards';
import { AuthService } from '@services';

@Controller()
@UseInterceptors(LoggingInterceptor)
@UsePipes(new ValidationPipe({ transform: true }))
export class AppController {
  @Inject()
  authService!: AuthService;

  @Post('/auth/login')
  @HttpCode(200)
  async login(@Body() request: LoginRequestDTO) {
    return this.authService.login(request);
  }

  @Post('/auth/refresh')
  @HttpCode(200)
  async refresh(@Body() request: RefreshRequestDTO) {
    return this.authService.refresh(request);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/auth/logout')
  @HttpCode(200)
  async logout(@Body() request: LogoutRequestDTO) {
    await this.authService.logout(request);
  }
}
