import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SignInDto } from './dto/signIn.dto';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/sign-in')
  @Public()
  async login(@Body() singinDto: SignInDto) {
    return this.authService.signIn(singinDto);
  }

  @Post('/register')
  @Public()
  @UsePipes(new ValidationPipe({ transform: true }))
  async register(@Body() register: RegisterDto) {
    return this.authService.register(register);
  }
}
