import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CreateAccountInput } from './dtos/create-account.dto';
import { ErrorMessage } from 'src/error/error_message';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<{ ok: boolean; error?: string }> {
    try {
      const oldUser = await this.userRepository.findOne({ email });
      if (oldUser) {
        return {
          ok: false,
          error: ErrorMessage.USER_EXIST_ERROR,
        };
      }
      const user = this.userRepository.create({ email, password, role });
      await this.userRepository.save(user);
    } catch (e) {
      return {
        ok: false,
        error: ErrorMessage.CREATE_USER_ERROR,
      };
    }
    return {
      ok: true,
    };
  }
}
