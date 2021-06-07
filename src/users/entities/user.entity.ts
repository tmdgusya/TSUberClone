import { Entity, Column, BeforeInsert, BeforeUpdate, OneToMany } from 'typeorm';
import { CoreEntity } from 'src/common/entities/core.entity';
import {
  ObjectType,
  InputType,
  Field,
  registerEnumType,
} from '@nestjs/graphql';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { ErrorMessage } from 'src/error/error_message';
import { IsEmail, IsEnum, IsString, IsBoolean } from 'class-validator';
import { Restaurant } from 'src/restaurants/entities/restaurants.entity';

enum UserRole {
  OWNER,
  CLIENT,
  DELEVERY,
}

registerEnumType(UserRole, { name: 'UserRole' });

@InputType('userInputType', { isAbstract: true })
@Entity()
@ObjectType()
export class User extends CoreEntity {
  @Column({ unique: true })
  @Field(type => String)
  @IsEmail()
  email: string;

  @Column({ select: false })
  @Field(type => String)
  @IsString()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  @Field(type => UserRole, { defaultValue: UserRole.CLIENT })
  @IsEnum(UserRole)
  role: UserRole;

  @Column({ default: false })
  @Field(type => Boolean)
  @IsBoolean()
  verified: boolean;

  @Field(type => [Restaurant])
  @OneToMany(
    type => Restaurant,
    restaurant => restaurant.owner,
  )
  restaurant: Restaurant[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (error) {
        throw new InternalServerErrorException(
          ErrorMessage.HASH_PASSWORD_ERROR,
        );
      }
    }
  }

  async checkPassword(password: string): Promise<Boolean> {
    try {
      return await bcrypt.compare(password, this.password);
    } catch (error) {
      throw new InternalServerErrorException(ErrorMessage.LOGIN_ERROR);
    }
  }
}
