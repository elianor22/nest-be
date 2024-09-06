import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignInDto {
  @IsEmail()
  email: string;

  @IsString({ message: 'Password is required' })
  @MinLength(8)
  password: string;
}
