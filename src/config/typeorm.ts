import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: +configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    entities: ['dist/**/*.entity{.ts,.js}'],
    synchronize: false,
    autoLoadEntities: true,
    migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
    seeds: [__dirname + '/../seeds/**/*{.ts,.js}'],
    ssl: configService.get('DB_SSL'),
    extra: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
    cli: {
      migrationsDir: __dirname + '/../migrations/',
    },
  }),
  inject: [ConfigService],
};
