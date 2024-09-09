import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { SignInDto } from './dto/signIn.dto';
import { IToken } from './interface/singIn.interface';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import * as bycrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { ApiResponse } from 'src/commons/api-response/api-response';

@Injectable()
export class AuthService {
  constructor(
    private readonly userSerice: UsersService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signIn(payload: SignInDto): Promise<ApiResponse<IToken>> {
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
        email: user.email,
        sub: user.id,
      };

      const token: IToken = await this.getToken(jwtPayload);
      await this.updateToken(user.id, token.refreshToken);
      return {
        statusCode: 200,
        message: 'Login successful',
        data: token,
      };
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  async register(payload: RegisterDto): Promise<UserEntity> {
    return await this.userSerice.create(payload);
  }

  async getToken(payload: { email: string; sub: string }): Promise<IToken> {
    const expiresIn: number = 15 * 60; // 15minutes expired token
    try {
      return {
        accessToken: await this.jwtService.signAsync(payload, {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
        }),
        expiresIn: expiresIn,
        refreshToken: await this.jwtService.signAsync(payload, {
          expiresIn: this.configService.get<string>('JWT_EXPIRES_REFRESH_IN'),
          secret: this.configService.get<string>('REFRESH_JWT_SECRET'),
        }),
      };
    } catch (error) {
      throw new Error('General server Error');
    }
  }

  async refreshToken(refreshToken: string): Promise<any> {
    try {
      const decoded = await this.jwtService.verifyAsync<{
        email: string;
        sub: string;
      }>(refreshToken, {
        secret: this.configService.get<string>('REFRESH_JWT_SECRET'),
      });

      const user: UserEntity = await this.userSerice.findByEmail(decoded.email);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      if (user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('hmmm');
      }

      const payload = {
        email: user.email,
        sub: user.id,
      };

      const newToken: IToken = await this.getToken(payload);
      await this.updateToken(user.id, newToken.refreshToken);

      return newToken;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Refresh token expired');
      }
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      throw new Error(error);
    }
  }

  async validateUser(email: string): Promise<UserEntity> {
    return await this.userSerice.findByEmail(email);
  }

  async updateToken(userId: string, refreshToken: string): Promise<void> {
    await this.userSerice.update(userId, {
      refreshToken: refreshToken,
    });
  }

  async removeToken(userId: string): Promise<void> {
    await this.userSerice.update(userId, {
      refreshToken: null,
    });
  }
}
