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

  it.todo('sendEmail');
  it.todo('sendVerification');
});
