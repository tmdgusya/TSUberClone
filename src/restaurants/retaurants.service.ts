import { Injectable } from '@nestjs/common';
import { Restaurant } from './entities/restaurants.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
  ) {}
  getAll(): Promise<Restaurant[]> {
    return this.restaurantRepository.find();
  }
  createRestaurant(restaurantInfo: CreateRestaurantDto): Promise<Restaurant> {
    const newRestaurant = this.restaurantRepository.create({
      ...restaurantInfo,
    });
    return this.restaurantRepository.save(newRestaurant);
  }
}
