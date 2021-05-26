import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class RestaurantResolver {
  @Query(returns => Boolean)
  public isPizzaGood(): boolean {
    return true;
  }
}
