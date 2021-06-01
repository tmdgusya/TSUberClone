import { Test } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Verfication } from './entities/verification.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';

const mockRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
};

const jwtMockService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

const mailMockService = {
  sensendVerificationEmail: jest.fn(),
};

type MockRepository<T = any> = Partial<
  Record<keyof Repository<User>, jest.Mock>
>;

describe('User Service Test', () => {
  let service: UserService;
  let userRepository: MockRepository;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Verfication),
          useValue: mockRepository,
        },
        {
          provide: JwtService,
          useValue: jwtMockService,
        },
        {
          provide: MailService,
          useValue: mailMockService,
        },
      ],
    }).compile();
    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User));
  });

  it('bed defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    it('should fail if user exist', () => {});
  });
  it.todo('login');
  it.todo('findById');
  it.todo('editProfile');
  it.todo('verifyEmail');
});
