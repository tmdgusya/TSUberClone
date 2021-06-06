import { MailService } from './mail.service';
import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constant';

jest.mock('got', () => {});

jest.mock('form-data', () => {
  return {
    append: jest.fn(),
  };
});

describe('Mail Service', () => {
  let service: MailService;
  const apiKey = 'testKey';
  const emailDomain = 'test@test.com';
  const fromEmail = 'testFrom@test.com';
  beforeEach(async () => {
    const modules = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            apiKey,
            emailDomain,
            fromEmail,
          },
        },
      ],
    }).compile();
    service = modules.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmail', () => {
    it('should call sendEmail', () => {
      const sendVerificationEmailArgs = {
        email: 'email',
        code: 'code',
      };
      jest.spyOn(service, 'sendEmail').mockImplementation(async () => {});
      service.sendVerificationEmail(
        sendVerificationEmailArgs.email,
        sendVerificationEmailArgs.email,
        sendVerificationEmailArgs.code,
      );
      expect(service.sendEmail).toHaveBeenCalledTimes(1);
      expect(service.sendEmail).toHaveBeenCalledWith(
        'Verify Your Email',
        'verify-email',
        sendVerificationEmailArgs.email,
        [
          { key: 'code', value: sendVerificationEmailArgs.code },
          { key: 'username', value: sendVerificationEmailArgs.email },
        ],
      );
    });
  });
  it.todo('sendVerification');
});
