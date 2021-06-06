import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { getConnection, Repository } from 'typeorm';
import * as request from 'supertest';
import { ErrorMessage } from 'src/error/error_message';
import { User } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import e from 'express';

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
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
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

  describe('userProfile', () => {
    const userId = 1;
    let user: User;
    beforeAll(async () => {
      user = await userRepository.findOne({ id: userId });
    });

    it("should see a user's profile", () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('x-jwt', jwtToken)
        .send({
          query: `{
            userProfile(userId:${userId}) {
              ok
              error
              user{
                email
              }
            }
          }`,
        })
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: {
                userProfile: {
                  ok,
                  error,
                  user: { email },
                },
              },
            },
          } = res;
          expect(ok).toBeTruthy();
          expect(error).toBeNull();
          expect(email).toEqual(userInfo.email);
        });
    });

    it('should not find a profile', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('x-jwt', jwtToken)
        .send({
          query: `{
            userProfile(userId:9999999) {
              ok
              error
              user{
                email
              }
            }
          }`,
        })
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: {
                userProfile: { ok, error, user },
              },
            },
          } = res;
          expect(ok).toBeFalsy();
          expect(error).toEqual(ErrorMessage.USER_NOT_FOUND);
          expect(user).toBeNull();
        });
    });
  });

  describe('me', () => {
    it('should find my profile', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('x-jwt', jwtToken)
        .send({
          query: `{
            me {
              email
            }
          }`,
        })
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: {
                me: { ok, email },
              },
            },
          } = res;
          expect(email).toEqual(userInfo.email);
        });
    });
    it('shouild not allow logged out users', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `{
            me {
              email
            }
          }`,
        })
        .expect(200)
        .expect(res => {
          const {
            body: { errors },
          } = res;
          const message = errors[0].message;
          expect(message).toEqual('Forbidden resource');
        });
    });
  });
  it.todo('editProfile');
  it.todo('verifyEmail');
});
