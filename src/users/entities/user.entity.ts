import { Entity, Column } from 'typeorm';
import { CoreEntity } from 'src/common/entities/core.entity';
import {
  ObjectType,
  InputType,
  Field,
  registerEnumType,
} from '@nestjs/graphql';

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
  email: string;

  @Column()
  @Field(type => String)
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  @Field(type => UserRole, { defaultValue: UserRole.CLIENT })
  role: UserRole;
}
