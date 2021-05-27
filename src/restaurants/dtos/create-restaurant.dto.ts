import { Field, ArgsType } from '@nestjs/graphql';
import { IsString, Length, IsBoolean } from 'class-validator';
import { type } from 'os';

@ArgsType()
export class CreateRestaurantDto {
  @Field(type => String)
  @IsString()
  @Length(5, 20)
  name: string;
  @Field(type => Boolean)
  @IsBoolean()
  isVegan: boolean;
  @Field(type => String)
  @IsString()
  address: string;
  @Field(type => String)
  @IsString()
  @Length(5, 10)
  ownerName: string;
  @Field(type => String)
  @IsString()
  categoryName: string;
}
