import { string } from 'joi';

export interface JwtModuleOptions {
  privateKey: string;
  tokenHeader: string;
}
