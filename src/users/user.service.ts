import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { ErrorMessage } from 'src/error/error_message';
import { Args, Mutation } from '@nestjs/graphql';
import { LoginOutput, LoginInputType } from './dtos/login-account.dto';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly config: ConfigService,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const oldUser = await this.userRepository.findOne({ email });
      if (oldUser) {
        return {
          ok: false,
          error: ErrorMessage.USER_EXIST_ERROR,
        };
      }
      const user = this.userRepository.create({ email, password, role });
      await this.userRepository.save(user);
    } catch (e) {
      return {
        ok: false,
        error: ErrorMessage.CREATE_USER_ERROR,
      };
    }
    return {
      ok: true,
    };
  }

  @Mutation(returns => LoginOutput)
  async login(
    @Args('input') { email, password }: LoginInputType,
  ): Promise<LoginOutput> {
    try {
      const user = await this.userRepository.findOne({ email });

      if (!user) {
        return {
          ok: false,
          error: ErrorMessage.LOGIN_ERROR,
        };
      }

      const isCorrectPassword: Boolean = await user.checkPassword(password);

      if (!isCorrectPassword) {
        return {
          ok: false,
          error: ErrorMessage.LOGIN_ERROR,
        };
      }

      const token = jwt.sign({ id: user.id }, this.config.get('TOKEN_SECRET'));

      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
}
