import { IsUUID } from 'class-validator';

export class RefreshRequestDTO {
  @IsUUID('4')
  refreshToken!: string;
}
