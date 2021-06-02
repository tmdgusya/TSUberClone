import { Test } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Verfication } from './entities/verification.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { ErrorMessage } from 'src/error/error_message';
import { async } from 'rxjs';

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
});

const jwtMockService = {
  sign: jest.fn(() => 'signed-token'),
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
  let jwtService: JwtService;
  beforeEach(async () => {
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
    jwtService = module.get<JwtService>(JwtService);
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

  describe('login', () => {
    const loginArgs = {
      email: 'test@test.com',
      password: 'Good',
    };

    const loginFail = {
      ok: false,
      error: ErrorMessage.LOGIN_ERROR,
    };

    it('should fails if user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const result = await service.login(loginArgs);
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
      expect(result).toEqual(loginFail);
    });

    it('should fails if user password is wrong', async () => {
      const mockUser = {
        id: 1,
        checkPassword: jest.fn().mockResolvedValue(false),
      };
      userRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.login(loginArgs);
      expect(result).toEqual(loginFail);
    });

    it('should return token if password correct', async () => {
      const mockUser = {
        id: 1,
        checkPassword: jest.fn().mockResolvedValue(true),
      };
      userRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.login(loginArgs);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toEqual({
        ok: true,
        token: 'signed-token',
      });
    });
  });

  describe('findById', () => {
    const findByIdArgs = {
      id: 1,
    };
    it('should find an existing user', async () => {
      userRepository.findOneOrFail.mockResolvedValue(findByIdArgs);
      const result = await service.findById(1);
      expect(result).toEqual({
        ok: true,
        user: findByIdArgs,
      });
    });

    it('should fail if no user if found', async () => {
      userRepository.findOneOrFail.mockRejectedValue(new Error());
      const result = await service.findById(1);
      expect(result).toEqual({
        ok: false,
        error: ErrorMessage.USER_NOT_FOUND,
      });
    });
  });

  describe('editProfile', () => {
    const oldUser = {
      email: 'test@test.com',
      verified: true,
    };
    const editProfileArgs = {
      userId: 1,
      input: {
        email: 'test@test.com',
      },
    };
    const newVerification = {
      code: 'code',
    };
    const newUser = {
      verified: false,
      email: editProfileArgs.input.email,
    };

    it('should change email', async () => {
      userRepository.findOne.mockResolvedValue(oldUser);
      verificationRepository.create.mockReturnValue(newVerification);
      verificationRepository.save.mockResolvedValue(newVerification);
      await service.editProfile(editProfileArgs.userId, editProfileArgs.input);
      expect(userRepository.findOne).toBeCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith(
        editProfileArgs.userId,
      );
      expect(verificationRepository.create).toHaveBeenCalledWith({
        user: newUser,
      });
      expect(verificationRepository.save).toHaveBeenCalledWith(newVerification);

      expect(mailMockService.sendVerificationEmail).toHaveBeenCalledWith(
        newUser.email,
        newUser.email,
        newVerification.code,
      );
    });

    it('should change password', async () => {
      const changeValue = {
        password: 'new1234',
      };
      const editProfileArgs = {
        userId: 1,
        input: changeValue,
      };
      userRepository.findOne.mockResolvedValue({
        password: 'old',
      });
      const result = await service.editProfile(
        editProfileArgs.userId,
        editProfileArgs.input,
      );
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(editProfileArgs.input);
      expect(result).toEqual({
        ok: true,
      });
    });

    it('should fail on Exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error());
      const result = await service.editProfile(
        editProfileArgs.userId,
        editProfileArgs.input,
      );
      expect(result).toEqual({
        ok: false,
        error: ErrorMessage.EDIT_USER_ERROR,
      });
    });
  });

  it.todo('verifyEmail');
});
