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
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { Verfication } from './entities/verification.entity';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Verfication)
    private readonly verificationRepository: Repository<Verfication>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
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
      const verification = await this.verificationRepository.save(
        this.verificationRepository.create({
          user,
        }),
      );
      this.mailService.sendVerificationEmail(
        user.email,
        user.email,
        verification.code,
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

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.userRepository.findOne({ id });
      if (!user) {
        throw Error();
      }
      return {
        ok: true,
        user,
      };
    } catch (error) {
      return {
        ok: false,
        error: ErrorMessage.USER_NOT_FOUND,
      };
    }
  }

  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      console.log('?');
      const user = await this.userRepository.findOne(userId);
      console.log('?');
      if (email) {
        user.email = email;
        user.verified = false;
        const verification = await this.verificationRepository.save(
          this.verificationRepository.create({ user }),
        );
        console.log('?');
        this.mailService.sendVerificationEmail(
          user.email,
          user.email,
          verification.code,
        );
      }
      user.changeProfile(email, password);
      console.log('??');
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
    return {
      ok: true,
    };
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verificationRepository.findOne(
        { code },
        { relations: ['user'] },
      );
      if (verification) {
        verification.user.verified = true;
        await this.userRepository.save(verification.user);
        await this.verificationRepository.delete(verification.id);
        return {
          ok: true,
        };
      }
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
}
