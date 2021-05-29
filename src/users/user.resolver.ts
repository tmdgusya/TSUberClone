import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import {
  CreateAccountOutput,
  CreateAccountInput,
} from './dtos/create-account.dto';
import { any } from 'joi';

@Resolver(of => User)
export class UserResolver {
  constructor(private readonly userSerive: UserService) {}

  @Query(type => Boolean)
  test() {
    return true;
  }

  @Mutation(returns => CreateAccountOutput)
  async createAccount(
    @Args('input') userDateInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    try {
      const error = await this.userSerive.createAccount(userDateInput);
      if (error) {
        return {
          ok: false,
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
}
