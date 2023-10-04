import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Document, Model, UpdateWriteOpResult } from 'mongoose';
import * as path from 'path';
import * as streamBuffers from 'stream-buffers';

import { UsersController } from './users.controller';
import { User, UserSchema } from './users.schema';
import { UsersService } from './users.service';
import { fileToBuffer } from '../utils/functions/test.utils';

const image = path.resolve(__dirname, '../../public/icon.png');

const checkMongoUpdatedRes = (res: UpdateWriteOpResult) => {
  expect(res.acknowledged).toBeTruthy();
  expect(res.matchedCount).toEqual(1);
  expect(res.modifiedCount).toEqual(1);
};

describe('UsersController', () => {
  let controller: UsersController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let userModel: Model<User>;
  let user: User & Document;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    userModel = mongoConnection.model(User.name, UserSchema);
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService, JwtService, { provide: getModelToken(User.name), useValue: userModel }],
    }).compile();
    controller = app.get<UsersController>(UsersController);
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

  describe('GET /profile', () => {
    it('Should return connected user profile', async () => {
      const userController = await controller.getOne({ user });
      expect(userController).not.toBeNull();
      expect(userController?.user_id).toEqual(user.user_id);
    });
    it('should throw NotFoundException', async () => {
      await expect(controller.getOne({})).rejects.toThrowError(NotFoundException);
    });
  });

  describe('GET /profile/:id', () => {
    it('should return the default saved object', async () => {
      const userController = await controller.getUser(user.user_id);
      expect(userController).not.toBeNull();
      expect(userController?.user_id).toEqual(user.user_id);
      expect(userController?.name).toEqual(user.name);
      expect(userController?.email).toEqual(user.email);
    });
    it('should throw NotFoundException', async () => {
      await expect(controller.getUser('test-id-that-does-not-exist')).rejects.toThrowError(NotFoundException);
    });
  });

  describe('PATCH /profile/:id', () => {
    it('should return the updated (name) object', async () => {
      const updatedInfo = {
        name: 'updatedTest',
      };
      const userController = await controller.updateUserInfo({ user }, updatedInfo);

      checkMongoUpdatedRes(userController);

      const updatedUser = await userModel.findOne({ user_id: user.user_id }).exec();

      expect(updatedUser?.name).toEqual(updatedInfo.name);
      expect(user.password).toEqual(updatedUser?.password);
    });

    it('should return the updated (password) object', async () => {
      const updatedInfo = {
        password: 'updatedPassword',
      };
      const userController = await controller.updateUserInfo({ user }, updatedInfo);

      checkMongoUpdatedRes(userController);

      const updatedUser = await userModel.findOne({ user_id: user.user_id }).exec();

      expect(user.name).toEqual(updatedUser?.name);
      expect(updatedUser?.password).not.toEqual(updatedInfo.password); // is password crypted ?
      expect(updatedUser?.password).not.toEqual(user.password); // is password updated ?
    });
  });

  describe('PUT /profile/image', () => {
    it('should upload image on current user', async () => {
      const imageBuffer = (await fileToBuffer(image)) as Buffer;

      const imageFiles: Express.Multer.File[] = [];
      const myReadableStreamBuffer = new streamBuffers.ReadableStreamBuffer({
        frequency: 10, // in milliseconds.
        chunkSize: 2048, // in bytes.
      });
      myReadableStreamBuffer.put(imageBuffer as Buffer);
      imageFiles.push({
        buffer: imageBuffer,
        fieldname: 'file',
        originalname: 'icon.png',
        encoding: '7bit',
        mimetype: 'image/png',
        destination: 'destination-path',
        filename: 'icon.png',
        path: image,
        size: 71634,
        stream: myReadableStreamBuffer,
      });

      const userController = await controller.uploadImage({ user }, imageFiles[0]);

      checkMongoUpdatedRes(userController);

      const updatedUser = await userModel.findOne({ user_id: user.user_id }).exec();

      expect(updatedUser?.image).toBeDefined();
      expect(updatedUser?.image.contentType).toBe('image/png');
    });
  });

  describe('GET /friends/.../:id', () => {
    it('should return following list', async () => {
      const newUser = await userModel.create({ name: 'testFriend', email: 'friend@test.com', password: 'testFriend', created_at: new Date() });

      // Adding newUser on user friend list
      await userModel.updateOne({ user_id: user.user_id }, { $addToSet: { friends: [newUser] } }).exec();

      // Mocking result from auth validator
      const updatedUser = await userModel.findOne({ user_id: user.user_id }).exec();
      // Calling controller function
      const userController = await controller.getUserFollow(user.user_id, { user: updatedUser });

      expect(user.friends).toHaveLength(0);
      expect(userController).toHaveLength(1); // case where user == connectedUser

      const userFriendController = await controller.getUserFollow(user.user_id, { user: newUser });

      expect(userFriendController).toHaveLength(1); // case where user != connectedUser
      expect(userFriendController[0].user_id).toBe(newUser.user_id);
    });

    it('should return followers list', async () => {
      const newUser = await userModel.create({ name: 'testFriend', email: 'friend@test.com', password: 'testFriend', created_at: new Date() });

      // Adding newUser on user friend list
      await userModel.updateOne({ user_id: user.user_id }, { $addToSet: { friends: [newUser] } }).exec();

      const userController = await controller.getUserFollower(newUser.user_id);

      expect(userController).toHaveLength(1);
      expect(userController[0].user_id).toBe(user.user_id);
    });

    it('should throw NotFoundException', async () => {
      await expect(controller.getUserFollower('test-id-that-does-not-exist')).rejects.toThrowError(NotFoundException);
      await expect(controller.getUserFollow('test-id-that-does-not-exist', { user })).rejects.toThrowError(NotFoundException);
    });
  });

  describe('PATCH friends/:id', () => {
    it('should add friend into current user friend list', async () => {
      const newUser = await userModel.create({ name: 'testFriend', email: 'friend@test.com', password: 'testFriend', created_at: new Date() });

      const userController = await controller.addUserFriend({ user }, newUser.user_id);

      checkMongoUpdatedRes(userController);

      const updatedUser = await userModel.findOne({ user_id: user.user_id }).exec();

      expect(updatedUser?.friends).toHaveLength(1);
    });

    it('should throw ConflictException', async () => {
      const newUser = await userModel.create({ name: 'testFriend', email: 'friend@test.com', password: 'testFriend', created_at: new Date() });

      await controller.addUserFriend({ user }, newUser.user_id);

      const updatedUser = await userModel.findOne({ user_id: user.user_id }).populate('friends', 'name user_id').exec();

      await expect(controller.addUserFriend({ user: updatedUser }, newUser.user_id)).rejects.toThrowError(ConflictException);
    });

    it('should throw NotFoundException', async () => {
      await expect(controller.addUserFriend({ user }, 'test-id-friend')).rejects.toThrowError(NotFoundException);
    });
  });

  describe('DELETE friends/:id', () => {
    it('should delete friend into current user friend list', async () => {
      const newUser = await userModel.create({ name: 'testFriend', email: 'friend@test.com', password: 'testFriend', created_at: new Date() });

      // Adding newUser on user friend list
      await userModel.updateOne({ user_id: user.user_id }, { $addToSet: { friends: [newUser] } }).exec();
      const updatedUser = await userModel.findOne({ user_id: user.user_id }).populate('friends', 'name user_id').exec();

      expect(updatedUser?.friends).toHaveLength(1);

      const userController = await controller.removeUserFriend({ user: updatedUser }, newUser.user_id);

      checkMongoUpdatedRes(userController);

      const reUpdatedUser = await userModel.findOne({ user_id: user.user_id }).exec();

      expect(reUpdatedUser?.friends).toHaveLength(0);
    });

    it('should throw BadRequestException', async () => {
      const newUser = await userModel.create({ name: 'testFriend', email: 'friend@test.com', password: 'testFriend', created_at: new Date() });

      await expect(controller.removeUserFriend({ user }, newUser.user_id)).rejects.toThrowError(BadRequestException);
    });

    it('should throw NotFoundException', async () => {
      await expect(controller.removeUserFriend({ user }, 'new_user_id')).rejects.toThrowError(NotFoundException);
    });
  });

  // TODO: PATCH permissions/:id
  // TODO: DELETE permissions/:id

  describe('DELETE /', () => {
    it('should delete current user', async () => {
      const userController = await controller.deleteUser({ user });

      checkMongoUpdatedRes(userController);

      const updatedUser = await userModel.findOne({ user_id: user.user_id }).exec();

      expect(user.deleted_at).toBeNull();
      expect(updatedUser?.deleted_at).not.toBeNull();
      expect(updatedUser?.expireAt).toBeDefined();

      expect(updatedUser?.deleted_at.getDate()).toBe(new Date().getDate());
      expect(updatedUser?.expireAt.getDate()).toBe(new Date().getDate() + 7); // 7 is the  delay
      expect(updatedUser?.deleted_at.getMonth()).toBe(new Date().getMonth());
      expect(updatedUser?.expireAt.getMonth()).toBe(new Date().getMonth());
      expect(updatedUser?.deleted_at.getFullYear()).toBe(new Date().getFullYear());
      expect(updatedUser?.expireAt.getFullYear()).toBe(new Date().getFullYear());
    });
  });

  describe('GET score/:app', () => {
    it('should get application score of the current user', async () => {
      const score = {
        applications: {
          kanji: {
            total_score: 1000,
            progression: {
              '5bf7987e-172b-42ab-bd7f-19b5bcbc383d': 76,
            },
            scores: {
              '2023-9-10': 976,
              '2023-9-11': 24,
            },
          },
        },
      };
      await userModel.updateOne({ user_id: user.user_id }, score).exec();

      const updatedUser = await userModel.findOne({ user_id: user.user_id }).exec();

      const userController = await controller.getAppUserScore({ user: updatedUser }, 'kanji');

      expect(userController).toEqual(score.applications.kanji);
    });
  });

  describe('PUT score/:app', () => {
    it('should update current user application score', async () => {
      const score = {
        applications: {
          kanji: {
            total_score: 999,
            progression: {
              '4bf7987e-172b-42ab-bd7f-19b5bcbc383d': 76,
            },
            scores: {
              '2022-9-10': 976,
              '2022-9-11': 24,
            },
          },
        },
      };

      const userController = await controller.updateAppUserScore({ user }, 'kanji', score.applications.kanji);

      checkMongoUpdatedRes(userController);

      const updatedUser = await userModel.findOne({ user_id: user.user_id }).exec();

      expect(updatedUser?.applications.kanji).toEqual(score.applications.kanji);
    });
  });

  describe('GET ranks/:app', () => {
    it('should get ranks list (desc sorted score)', async () => {
      const score = {
        applications: {
          kanji: {
            total_score: 1000,
            progression: {
              '5bf7987e-172b-42ab-bd7f-19b5bcbc383d': 76,
            },
            scores: {
              '2023-9-10': 976,
              '2023-9-11': 24,
            },
          },
        },
      };
      await userModel.updateOne({ user_id: user.user_id }, score).exec();

      const userController = await controller.getRank('kanji');

      expect(userController).toHaveLength(1);
      expect(userController[0].user_id).toEqual(user.user_id);
      expect(userController[0].applications.kanji.total_score).toEqual(score.applications.kanji.total_score);
    });
  });
});
