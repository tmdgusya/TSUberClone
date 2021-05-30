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
  async login(@Args('input') loginInputData: LoginInputType) {
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
    console.log(authUser);
    return authUser;
  }
}
