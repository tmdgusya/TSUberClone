import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { ConfigService } from '@nestjs/config';
import { JwtService } from 'src/jwt/jwt.service';
import { Verfication } from './entities/verification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Verfication]),
    ConfigService,
    JwtService,
  ],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UsersModule {}
