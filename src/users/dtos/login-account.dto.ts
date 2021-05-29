import { InputType, Field, PickType, ObjectType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/common-dto/output.dto';
import { User } from '../entities/user.entity';

@ObjectType()
export class LoginOutput extends MutationOutput {
  @Field(type => String, { nullable: true })
  token?: string;
}

@InputType()
export class LoginInputType extends PickType(User, ['email', 'password']) {}
