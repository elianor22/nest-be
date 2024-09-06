import { IsUUID } from 'class-validator';

export class FindUserDto {
  @IsUUID('4', { message: 'Invalid UUID' })
  id: string;
}
