import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import { createConnection, Connection, getConnection } from 'typeorm';
import { ConfigService } from '@modules';
import { AuthService, UserService } from '@services';
import { v4 as uuid } from 'uuid';
import { JwtService } from '@nestjs/jwt';

describe('Auth e2e tests', () => {
  let app: INestApplication;
  let connection: Connection;
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();

    const configService = app.get(ConfigService);
    userService = app.get(UserService);
    authService = app.get(AuthService);
    jwtService = app.get(JwtService);

    connection = await createConnection(configService.testsMigrationsConfig);
    await connection.runMigrations();
    await connection.close();

    connection = getConnection();
  });

  beforeEach(async () => {
    await truncateAll(connection);
    await userService.create({
      firstName: 'foo',
      lastName: 'foo',
      patronymic: 'foo',
      email: 'foo',
      password: 'foo',
    });
  });

  afterAll(async () => {
    await truncateAll(connection);
    await connection.close();
    await app.close();
  });

  it(`User can successfully login`, async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        login: 'foo',
        password: 'foo',
      })
      .expect(200);

    expect(res.body.token).toBeTruthy();
    expect(res.body.refreshToken).toBeTruthy();
  });

  it(`User gets 403 on invalid credentials`, async () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        login: 'foo',
        password: 'invalid password',
      })
      .expect(403);
  });

  it(`User receives 401 on expired token`, async () => {
    const user = await userService.findByLogin('foo');
    const token = jwtService.sign({ id: user!.id }, { expiresIn: '1ms' });

    return request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: user!.id })
      .expect(401);
  });

  it(`User can get new access token using refresh token`, async () => {
    const user = await userService.findByLogin('foo');
    const { refreshToken } = await authService.issueTokenPair(user!.id);

    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(res.body.token).toBeTruthy();
    expect(res.body.refreshToken).toBeTruthy();
  });

  it(`User get 404 on invalid refresh token`, async () => {
    const user = await userService.findByLogin('foo');
    await authService.issueTokenPair(user!.id);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: uuid() })
      .expect(404);
  });

  it(`User can use refresh token only once`, async () => {
    const user = await userService.findByLogin('foo');
    const { refreshToken } = await authService.issueTokenPair(user!.id);

    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(res.body.token).toBeTruthy();
    expect(res.body.refreshToken).toBeTruthy();

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(404);
  });

  it(`Refresh tokens become invalid on logout`, async () => {
    const user = await userService.findByLogin('foo');
    const { refreshToken } = await authService.issueTokenPair(user!.id);

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ login: 'foo', password: 'foo' })
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${res.body.token}`)
      .send({ userId: user!.id })
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(404);
  });

  it(`Multiple refresh tokens are valid`, async () => {
    const first = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ login: 'foo', password: 'foo' });

    const second = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ login: 'foo', password: 'foo' });

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: first.body.refreshToken })
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: second.body.refreshToken })
      .expect(200);
  });
});

async function truncateAll(connection: Connection) {
  await connection.query(`
    DELETE FROM refresh_token;
    DELETE FROM user;
  `);
}
