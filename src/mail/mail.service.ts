import { Injectable, Inject } from '@nestjs/common';
import { CONFIG_OPTIONS } from '../common/common.constant';
import { MailModuleOptions } from './mail.interface';
import got from 'got';
import * as FormData from 'form-data';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    console.log(options);
    this.sendEmail('Hi', 'GOOD', 'dev0jsh@gmail.com')
      .then(() => console.log('ggod'))
      .catch(err => console.log(err));
  }

  private async sendEmail(subject: string, content: string, userEmail: string) {
    const form = new FormData();
    form.append('from', `Excited User <mailgun@${this.options.emailDomain}>`);
    form.append('to', `${userEmail}`);
    form.append('subject', subject);
    form.append('text', content);
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
}
