import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { SignInDto } from './dto/signIn.dto';
import { ISignInResponse } from './interface/singIn.interface';
import { JwtService } from '@nestjs/jwt';
import * as bycrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { UserEntity } from 'src/modules/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userSerice: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(payload: SignInDto): Promise<ISignInResponse> {
    try {
      const user = await this.userSerice.findByEmail(payload.email);

      if (!user) {
        throw new NotFoundException('Account Not Found');
      }

      const compare = bycrypt.compareSync(payload.password, user.password);

      if (!compare) {
        throw new BadRequestException('Wrong Password');
      }

      const jwtPayload = {
        name: user.name,
        sub: user.id,
      };
      const expiresIn = 24 * 60 * 60; // 1day expired token
      return {
        accessToken: await this.jwtService.signAsync(jwtPayload),
        expiresIn,
      };
    } catch (error) {
      throw error;
    }
  }

  async register(payload: RegisterDto): Promise<UserEntity> {
    return await this.userSerice.create(payload);
  }
}
