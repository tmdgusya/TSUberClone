import { ObjectType, Field } from '@nestjs/graphql';
import { IsString, IsBoolean, Length } from 'class-validator';

@ObjectType()
export class Restaurant {
  @Field(type => String)
  name: string;

  @Field(type => Boolean, { nullable: true })
  isVegan: boolean;

  @Field(type => String)
  address: string;

  @Field(type => String)
  ownerName: string;
}
