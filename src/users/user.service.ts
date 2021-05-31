import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { ErrorMessage } from 'src/error/error_message';
import { Args, Mutation } from '@nestjs/graphql';
import { LoginOutput, LoginInputType } from './dtos/login-account.dto';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput } from './dtos/edit-profile.dto';
import { Verfication } from './entities/verification.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Verfication)
    private readonly verificationRepository: Repository<Verfication>,
    private readonly jwtService: JwtService,
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
      await this.verificationRepository.save(
        this.verificationRepository.create({
          user,
        }),
      );
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
      const user = await this.userRepository.findOne(
        { email },
        { select: ['id', 'password'] },
      );

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

      const token = this.jwtService.sign({ id: user.id });

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

  async findById(id: number): Promise<User> {
    return this.userRepository.findOne({ id });
  }

  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<User> {
    const user = await this.userRepository.findOne(userId);
    if (email) {
      user.email = email;
      user.verified = false;
      await this.verificationRepository.save(
        this.verificationRepository.create({ user }),
      );
    }
    user.changeProfile(email, password);
    return await this.userRepository.save(user);
  }

  async verifyEmail(code: string): Promise<Boolean> {
    try {
      const verification = await this.verificationRepository.findOne(
        { code },
        { relations: ['user'] },
      );
      if (verification) {
        verification.user.verified = true;
        await this.userRepository.save(verification.user);
        return true;
      }
    } catch (e) {
      return false;
    }
  }
}
