import { IsString, IsNotEmpty } from 'class-validator';

export class LoginRequestDTO {
  @IsString()
  @IsNotEmpty()
  login!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
