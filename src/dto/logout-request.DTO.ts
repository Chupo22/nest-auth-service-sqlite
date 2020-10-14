import { IsUUID } from 'class-validator';

export class LogoutRequestDTO {
  @IsUUID('4')
  userId!: string;
}
