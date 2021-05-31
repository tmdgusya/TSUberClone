import { Module, DynamicModule } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constant';
import { MailModuleOptions } from './mail.interface';
import { MailService } from './mail.service';

@Module({})
export class MailModule {
  static forRoot(oprtions: MailModuleOptions): DynamicModule {
    return {
      module: MailModule,
      imports: [],
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: oprtions,
        },
        MailService,
      ],
      exports: [CONFIG_OPTIONS, MailService],
    };
  }
}
