import { MutationOutput } from 'src/common/common-dto/output.dto';
import { ObjectType, PickType, InputType } from '@nestjs/graphql';
import { Verfication } from '../entities/verification.entity';

@ObjectType()
export class VerifyEmailOutput extends MutationOutput {}

@InputType()
export class VerifyEmailInput extends PickType(Verfication, ['code']) {}
