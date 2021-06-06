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

const userInfo = {
  email: 'tmdgusya@test.com',
  password: 'test12',
  role: 'OWNER',
};

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

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
          const {
            body: {
              data: { createAccount },
            },
          } = res;
          expect(createAccount.ok).toBeTruthy();
          expect(createAccount.error).toBeNull();
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
          const {
            body: {
              data: { createAccount },
            },
          } = res;
          expect(createAccount.ok).toBeFalsy();
          expect(createAccount.error).toEqual(ErrorMessage.USER_EXIST_ERROR);
        });
    });
  });
  describe('login', () => {
    it('should login with correct credentials', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation {
            login(input: {
              email : "${userInfo.email}",
              password: "${userInfo.password}"
            }) {
              ok
              error
              token
            }
          }`,
        })
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: { login },
            },
          } = res;
          expect(login.ok).toBeTruthy();
          expect(login.token).toEqual(expect.any(String));
          expect(login.error).toBeNull();
          jwtToken = login.token;
        });
    });

    it('should not be able to login with wrong credentials', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation {
            login(input: {
              email : "${userInfo.email}",
              password: "wrongpwd"
            }) {
              ok
              error
              token
            }
          }`,
        })
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: { login },
            },
          } = res;
          expect(login.ok).toBeFalsy();
          expect(login.token).toBeNull();
          expect(login.error).toEqual(ErrorMessage.LOGIN_ERROR);
        });
    });
  });
  it.todo('userProfile');
  it.todo('me');
  it.todo('editProfile');
  it.todo('verifyEmail');
});
