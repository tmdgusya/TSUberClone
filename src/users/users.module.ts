import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { Verfication } from './entities/verification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Verfication])],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UsersModule {}
