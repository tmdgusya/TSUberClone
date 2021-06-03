import { JwtService } from './jwt.service';
import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constant';

import * as jwt from 'jsonwebtoken';

const USER_ID = 1;

jest.mock('jsonwebtoken', () => {
  return {
    sign: jest.fn().mockReturnValue('token'),
    verify: jest.fn().mockReturnValue({
      id: 1,
    }),
  };
});

describe('JwtService', () => {
  let service: JwtService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            privateKey: 'test',
          },
        },
      ],
    }).compile();
    service = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sign', () => {
    it('should return a signed token', async () => {
      const token = service.sign({ id: USER_ID });
      expect(jwt.sign).toHaveBeenCalledTimes(USER_ID);
      expect(jwt.sign).toHaveBeenCalledWith({ id: USER_ID }, 'test');
      expect(jwt.sign({ id: USER_ID }, 'privateKey')).toEqual('token');
    });
  });
  describe('verify', () => {
    it('should return the decoded token', () => {
      const decodedToken = service.verify('token');
      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(jwt.verify).toHaveBeenCalledWith('token', 'test');
      expect(decodedToken).toEqual({
        id: USER_ID,
      });
    });
  });
});
