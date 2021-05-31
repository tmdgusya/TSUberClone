import { Entity, Column, BeforeInsert, BeforeUpdate } from 'typeorm';
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
import { IsEmail, IsEnum } from 'class-validator';

enum UserRole {
  OWNER,
  CLIENT,
  DELEVERY,
}

registerEnumType(UserRole, { name: 'UserRole' });

@InputType({ isAbstract: true })
@Entity()
@ObjectType()
export class User extends CoreEntity {
  @Column()
  @Field(type => String)
  @IsEmail()
  email: string;

  @Column({ select: false })
  @Field(type => String)
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
  verified: boolean;

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

  changeProfile(email?: string, password?: string) {
    if (email) {
      this.email = email;
    }
    if (password) {
      this.password = password;
    }
  }
}
