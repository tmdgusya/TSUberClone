import { MailService } from './mail.service';
import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constant';
import * as FormData from 'form-data';
import got from 'got/dist/source';

jest.mock('got');

jest.mock('form-data');

const TEST_DOMAIN = 'test@test.com';

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
      jest.spyOn(service, 'sendEmail').mockImplementation(async () => {
        return true;
      });
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
  describe('sendEmail', () => {
    it('send email', async () => {
      const result = await service.sendEmail('', '', '', []);
      const formspy = jest.spyOn(FormData.prototype, 'append');
      expect(formspy).toHaveBeenCalled();
      expect(got.post).toHaveBeenCalledTimes(1);
      expect(got.post).toHaveBeenCalledWith(
        `https://api.mailgun.net/v3/${TEST_DOMAIN}/messages`,
        expect.any(Object),
      );
      expect(result).toBeTruthy();
    });

    it('fails on error', async () => {
      jest.spyOn(got, 'post').mockImplementation(() => {
        throw new Error();
      });
      const result = await service.sendEmail('', '', '', []);
      expect(result).toBeFalsy();
    });
  });
});
