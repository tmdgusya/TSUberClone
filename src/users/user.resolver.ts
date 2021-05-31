import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { MutationOutput } from 'src/common/common-dto/output.dto';
import { LoginOutput, LoginInputType } from './dtos/login-account.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { ErrorMessage } from 'src/error/error_message';
import { EditProfileOutput, EditProfileInput } from './dtos/edit-profile.dto';
import { VerifyEmailOutput, VerifyEmailInput } from './dtos/verify-email.dto';

@Resolver(of => User)
export class UserResolver {
  constructor(private readonly userSerive: UserService) {}

  @Query(type => Boolean)
  test() {
    return true;
  }

  @Mutation(returns => MutationOutput)
  async createAccount(
    @Args('input') userDateInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    try {
      const { ok, error } = await this.userSerive.createAccount(userDateInput);
      if (error) {
        return {
          ok,
          error,
        };
      }
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

  @Mutation(returns => LoginOutput)
  async login(
    @Args('input') loginInputData: LoginInputType,
  ): Promise<LoginOutput> {
    try {
      return await this.userSerive.login(loginInputData);
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  @Query(returns => User)
  @UseGuards(AuthGuard)
  me(@AuthUser() authUser: User) {
    return authUser;
  }

  @Query(returns => UserProfileOutput)
  @UseGuards(AuthGuard)
  async userProfile(
    @Args() userProfileInput: UserProfileInput,
  ): Promise<UserProfileOutput> {
    try {
      const user = await this.userSerive.findById(userProfileInput.userId);
      console.log(user);
      if (!user) {
        throw Error();
      }
      return {
        ok: true,
        user,
      };
    } catch (e) {
      return {
        error: ErrorMessage.USER_NOT_FOUND,
        ok: false,
      };
    }
  }

  @UseGuards(AuthGuard)
  @Mutation(returns => EditProfileOutput)
  async editProfile(
    @AuthUser() authUser: User,
    @Args('input') editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      await this.userSerive.editProfile(authUser.id, editProfileInput);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  @Mutation(returns => VerifyEmailOutput)
  async verifyEmail(@Args('input') { code }: VerifyEmailInput) {
    try {
      await this.userSerive.verifyEmail(code);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
}
