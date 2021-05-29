import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CreateAccountInput } from './dtos/create-account.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<string | undefined> {
    //TODO check new User
    try {
      const oldUser = await this.userRepository.findOne({ email });
      if (oldUser) {
        // make Error User EXISTS!!
        return 'THERE IS A USER WITH THAT EMAIL ALREADY';
      }
      //TODO if new User => create Account & Hashing PWD
      //TODO if process done => return true else return Error
      await this.userRepository.save({ email, password, role });
    } catch (e) {
      return "COULDN'T CREATE ACCOUNT";
    }
  }
}
