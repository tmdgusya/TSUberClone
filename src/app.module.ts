import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'jeongseunghyeon',
      password: '12345',
      database: 'nuber-eats',
      synchronize: true,
      logging: true,
      entities: ['src/entity/**/*.ts'],
      migrations: ['src/migration/**/*.ts'],
      subscribers: ['src/subcribe/**/*.ts'],
    }),
    RestaurantsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
