import { NestMiddleware, Injectable, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CONFIG_OPTIONS } from './jwt.constant';
import { JwtModuleOptions } from './jwt.interface';
import { JwtService } from './jwt.service';
import { UserService } from 'src/users/user.service';

@Injectable()
export class JwtMiddleWare implements NestMiddleware {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    if (this.options.tokenHeader in req.headers) {
      const token = req.headers[this.options.tokenHeader];
      const decoded = this.jwtService.verify(token.toString());
      if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
        try {
          const user = await this.userService.findById(decoded['id']);
          req['user'] = user;
        } catch (error) {}
      }
    }
    next();
  }
}
