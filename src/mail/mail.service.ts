import { Injectable, Inject } from '@nestjs/common';
import { CONFIG_OPTIONS } from '../common/common.constant';
import { MailModuleOptions, EmailVar } from './mail.interface';
import got from 'got';
import * as FormData from 'form-data';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {}

  public async sendEmail(
    subject: string,
    templateName: string,
    userEmail: string,
    emailVars: EmailVar[],
  ) {
    const form = new FormData();
    form.append(
      'from',
      `Roach From RoachEats <mailgun@${this.options.emailDomain}>`,
    );
    form.append('to', `${userEmail}`);
    form.append('subject', subject);
    form.append('template', templateName);
    emailVars.forEach(eVar => form.append(`v:${eVar.key}`, eVar.value));
    try {
      const response = await got(
        `https://api.mailgun.net/v3/${this.options.emailDomain}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(
              `api:${this.options.apiKey}`,
            ).toString('base64')}`,
          },
          body: form,
        },
      );
      console.log('!@#!@#!@: ' + response.body);
    } catch (e) {
      console.log(e);
    }
  }

  sendVerificationEmail(
    userEmail: string,
    email: string,
    verificationCode: string,
  ) {
    this.sendEmail('Verify Your Email', 'verify-email', userEmail, [
      { key: 'code', value: verificationCode },
      { key: 'username', value: email },
    ]);
  }
}
