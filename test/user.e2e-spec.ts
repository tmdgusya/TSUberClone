import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { getConnection } from 'typeorm';
import * as request from 'supertest';
import { ErrorMessage } from 'src/error/error_message';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});

const GRAPHQL_ENDPOINT = '/graphql';

describe('UserModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    await app.close();
  });

  describe('createAccount', () => {
    const userInfo = {
      email: 'tmdgusya@test.com',
      password: 'test12',
      role: 'OWNER',
    };

    it('should create Account', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation {
            createAccount(input : {
              email : "${userInfo.email}",
              password: "${userInfo.password}",
              role: ${userInfo.role}
            }) {
              ok
              error
            }
          }`,
        })
        .expect(200)
        .expect(res => {
          expect(res.body.data.createAccount.ok).toBeTruthy();
          expect(res.body.data.createAccount.error).toBeNull();
        });
    });

    it('shoud fail if account already exist', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation {
            createAccount(input : {
              email : "${userInfo.email}",
              password: "${userInfo.password}",
              role: ${userInfo.role}
            }) {
              ok
              error
            }
          }`,
        })
        .expect(200)
        .expect(res => {
          expect(res.body.data.createAccount.ok).toBeFalsy();
          expect(res.body.data.createAccount.error).toEqual(
            ErrorMessage.USER_EXIST_ERROR,
          );
        });
    });
  });
  it.todo('me');
  it.todo('userProfile');
  it.todo('login');
  it.todo('editProfile');
  it.todo('verifyEmail');
});
