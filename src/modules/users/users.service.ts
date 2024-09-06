import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { createPaginateConfig } from 'src/commons/paginate.config';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USERS_REPOSITORY')
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    try {
      const userIsExist = await this.userRepository.findOne({
        where: {
          email: createUserDto.email,
        },
      });

      if (userIsExist) {
        throw new ConflictException('User already exists');
      }

      const saltRounds: number = 10;
      const salt = bcrypt.genSaltSync(saltRounds);
      const hashPassword = bcrypt.hashSync(createUserDto.password, salt);
      const payload = {
        ...createUserDto,
        password: hashPassword,
      };
      const createdUser = await this.userRepository.save(payload);
      return plainToInstance(UserEntity, createdUser);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAll(query: PaginateQuery): Promise<Paginated<UserEntity>> {
    const queryBuilder: SelectQueryBuilder<UserEntity> =
      this.userRepository.createQueryBuilder();

    return await paginate<UserEntity>(
      query,
      queryBuilder,
      createPaginateConfig(),
    );
  }

  async findOne(id: string): Promise<UserEntity> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id,
        },
      });
      if (!user) {
        throw new NotFoundException('User Not Found');
      }
      return plainToInstance(UserEntity, user);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id,
        },
      });
      if (!user) {
        throw new NotFoundException('User Not Found');
      }

      // first method
      // Object.assign(user, updateUserDto);
      // const userUpdated = await this.userRepository.save(user);

      //==========================//

      // seconds Method
      const userUpdated = await this.userRepository.update(id, {
        ...updateUserDto,
      });

      return userUpdated;
    } catch (error) {
      console.log(error);

      throw error;
    }
  }

  async remove(id: string): Promise<UserEntity> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id,
        },
      });
      if (!user) {
        throw new NotFoundException('User Not Found');
      }
      return await this.userRepository.remove(user);
    } catch (error) {
      throw error;
    }
  }

  async findByEmail(email: string): Promise<UserEntity> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          email,
        },
      });
      if (!user) {
        throw new NotFoundException('User Not Found');
      }
      return user;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
