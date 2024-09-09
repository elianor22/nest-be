import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { usersProviders } from 'src/modules/users/users.provider';
import { UsersModule } from 'src/modules/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from 'src/database/database.module';
import { jwtConstants } from 'src/constants/jwt-constant';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { LocalStrategy } from './strategies/local.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      global: true,
      useFactory: async (configService: ConfigService) => ({
        secret: jwtConstants.secret,
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    ...usersProviders,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    LocalStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
