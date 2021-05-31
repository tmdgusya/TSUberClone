import { InputType, ObjectType, Field } from '@nestjs/graphql';
import { Entity, Column, OneToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from './user.entity';
import { v4 as uuid } from 'uuid';

@InputType({ isAbstract: true })
@Entity()
@ObjectType()
export class Verfication extends CoreEntity {
  @Column()
  @Field(type => String)
  code: string;

  @OneToOne(type => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @BeforeInsert()
  createCode(): void {
    this.code = uuid();
  }
}
