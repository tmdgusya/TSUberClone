import { Injectable } from '@nestjs/common';
import { Restaurant } from './entities/restaurants.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { User } from 'src/users/entities/user.entity';
import { ErrorMessage } from 'src/error/error_message';
import { Category } from './entities/category.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async createRestaurant(
    owner: User,
    restaurantInfo: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurantRepository.create({
        ...restaurantInfo,
      });
      newRestaurant.owner = owner;
      const categoryName = restaurantInfo.categoryName.trim().toLowerCase();
      const categorySlug = categoryName.replace('/ /g', '-');
      let category = await this.categoryRepository.findOne({
        slug: categorySlug,
      });
      if (!category) {
        category = await this.categoryRepository.save(
          this.categoryRepository.create({
            slug: categorySlug,
            name: categoryName,
          }),
        );
      }
      newRestaurant.category = category;
      await this.restaurantRepository.save(newRestaurant);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: ErrorMessage.RESTAURANT_NOT_FOUND,
      };
    }
  }
}
