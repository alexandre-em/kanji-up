import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Document, Model } from 'mongoose';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { AppsService } from '../apps/apps.service';
import { MailService } from '../mail/mail.service';
import { SessionService } from '../session/session.service';
import { App, AppSchema } from '../apps/apps.schema';
import { User, UserSchema } from '../users/users.schema';
import { UsersService } from '../users/users.service';
import { MailerService } from '@nestjs-modules/mailer';
import { Session, SessionSchema } from '../session/session.schemas';
import { UnauthorizedException } from '@nestjs/common';
import { RegisterDTO } from './auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let appModel: Model<App>;
  let userModel: Model<User>;
  let sessionModel: Model<Session>;
  let user: User & Document;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    appModel = mongoConnection.model(App.name, AppSchema);
    userModel = mongoConnection.model(User.name, UserSchema);
    sessionModel = mongoConnection.model(Session.name, SessionSchema);
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        JwtService,
        AppsService,
        MailService,
        SessionService,
        UsersService,
        { provide: getModelToken(App.name), useValue: appModel },
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getModelToken(Session.name), useValue: sessionModel },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        {
          name: 'MAILER_OPTIONS',
          provide: 'MAILER_OPTIONS',
          useValue: {
            transport: 'smtps://user@domain.com:pass@smtp.domain.com',
          },
        },
      ],
    }).compile();
    controller = app.get<AuthController>(AuthController);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  afterEach(async () => {
    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  beforeEach(async () => {
    user = await userModel.create({ name: 'test', email: 'test@test.com', password: 'test', created_at: new Date() });
  });

  describe('POST login', () => {
    it('Should be able to login', async () => {
      let result: { access_token?: string } = {};
      const res = {
        cookie: jest.fn(() => ({
          send: jest.fn((r) => {
            result = r;
          }),
        })),
      };

      // Mock confirmed email
      await userModel.updateOne({ user_id: user.user_id }, { email_confirmed: true }).exec();

      const updatedUser = await userModel.findOne({ user_id: user.user_id }).exec();

      await controller.login({ user: updatedUser }, res);

      expect(result.access_token).toBeDefined(); // Return access_token

      const sessionCreated = await sessionModel.findOne({ user_id: user.user_id }).exec();

      expect(sessionCreated).not.toBeNull();
      expect(sessionCreated?.user_id).toBe(user.user_id);
      expect(sessionCreated?.token).toBe(result.access_token);
    });

    it('throw UnauthorizedException (email not confirmed))', async () => {
      let result: { access_token?: string } = {};
      const res = {
        cookie: jest.fn(() => ({
          send: jest.fn((r) => {
            result = r;
          }),
        })),
      };

      await expect(controller.login({ user }, res)).rejects.toThrowError(UnauthorizedException);
    });
  });

  describe('POST logout', () => {
    it('Should be able to logout', async () => {
      let result: { access_token?: string } = {};
      let status: { status?: string } = {};

      const res = {
        cookie: jest.fn((key: string, value: string) => {
          result = {
            [key]: value,
          };

          return {
            send: jest.fn((r) => {
              status = r;
            }),
          };
        }),
      };

      // Mock confirmed email
      await userModel.updateOne({ user_id: user.user_id }, { email_confirmed: true }).exec();

      const updatedUser = await userModel.findOne({ user_id: user.user_id }).exec();
      await controller.login({ user: updatedUser }, res);

      expect(result.access_token).toBeDefined(); // Return access_token
      const sessionBefore = await sessionModel.findOne({ user_id: user.user_id }).exec();

      expect(sessionBefore).not.toBeNull();
      expect(sessionBefore?.token).toBe(result.access_token);

      await controller.logout(
        {
          cookies: {
            access_token: result.access_token,
          },
        },
        res,
      );

      expect(result.access_token).toBe(''); // access_token cleared from cookies
      expect(status.status).toBe('ok');

      const sessionAfter = await sessionModel.findOne({ user_id: user.user_id }).exec();

      expect(sessionAfter).toBeNull();
    });
  });

  describe('POST register', () => {
    it('Should create a new user', async () => {
      const body: RegisterDTO = {
        email: 'new.email@test.com',
        password: 'password',
        name: 'new test',
        created_at: new Date(),
      };

      const newUser = await controller.register(body);

      expect(newUser.email).toBe(body.email);
      expect(newUser.name).toBe(body.name);
      expect(newUser.password).not.toBe(body.password); // password crypted
      expect(newUser.email_confirmed).toBeFalsy();
    });
  });
});
