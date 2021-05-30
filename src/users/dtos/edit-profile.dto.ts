import { MutationOutput } from 'src/common/common-dto/output.dto';
import { ObjectType, PickType, InputType, PartialType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';

@ObjectType()
export class EditProfileOutput extends MutationOutput {}

@InputType()
export class EditProfileInput extends PartialType(
  PickType(User, ['email', 'password']),
) {}
