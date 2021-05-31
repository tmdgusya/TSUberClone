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
    return await this.userSerive.createAccount(userDateInput);
  }

  @Mutation(returns => LoginOutput)
  async login(
    @Args('input') loginInputData: LoginInputType,
  ): Promise<LoginOutput> {
    return await this.userSerive.login(loginInputData);
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
    return await this.userSerive.findById(userProfileInput.userId);
  }

  @UseGuards(AuthGuard)
  @Mutation(returns => EditProfileOutput)
  async editProfile(
    @AuthUser() authUser: User,
    @Args('input') editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    return await this.userSerive.editProfile(authUser.id, editProfileInput);
  }

  @Mutation(returns => VerifyEmailOutput)
  async verifyEmail(@Args('input') { code }: VerifyEmailInput) {
    return await this.userSerive.verifyEmail(code);
  }
}
