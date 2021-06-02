import { Test } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Verfication } from './entities/verification.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { ErrorMessage } from 'src/error/error_message';

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
});

const jwtMockService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

const mailMockService = {
  sendVerificationEmail: jest.fn(),
};

type UserMockRepository<T = any> = Partial<
  Record<keyof Repository<User>, jest.Mock>
>;

type VerificationMockRepository<T = any> = Partial<
  Record<keyof Repository<Verfication>, jest.Mock>
>;

describe('User Service Test', () => {
  let service: UserService;
  let userRepository: UserMockRepository;
  let verificationRepository: VerificationMockRepository;
  let emailService: MailService;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verfication),
          useValue: mockRepository(),
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
    verificationRepository = module.get(getRepositoryToken(Verfication));
    emailService = module.get<MailService>(MailService);
  });

  it('bed defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    const defaultCreateArgs = {
      email: 'test@test.com',
      password: 'Good',
      role: 0,
    };

    it('should fail if user exist', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        password: 'test',
      });
      expect(await service.createAccount(defaultCreateArgs)).toEqual({
        ok: false,
        error: ErrorMessage.USER_EXIST_ERROR,
      });
    });

    it('should create a new user', async () => {
      userRepository.findOne.mockReturnValue(undefined);
      userRepository.create.mockReturnValue(defaultCreateArgs);
      userRepository.save.mockResolvedValue({ user: defaultCreateArgs });
      verificationRepository.create.mockReturnValue(defaultCreateArgs);
      verificationRepository.save.mockResolvedValue({
        code: 'code',
      });

      const result = await service.createAccount(defaultCreateArgs);

      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith(defaultCreateArgs);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(defaultCreateArgs);
      expect(verificationRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationRepository.create).toHaveBeenCalledWith({
        user: defaultCreateArgs,
      });
      expect(verificationRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationRepository.save).toHaveBeenCalledWith(
        defaultCreateArgs,
      );
      expect(emailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
      );
      expect(result).toEqual({
        ok: true,
      });
    });

    it('should fail on exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error('Error Test'));
      const result = await service.createAccount(defaultCreateArgs);
      expect(result).toEqual({
        ok: false,
        error: ErrorMessage.CREATE_USER_ERROR,
      });
    });
  });
  it.todo('login');
  it.todo('findById');
  it.todo('editProfile');
  it.todo('verifyEmail');
});
