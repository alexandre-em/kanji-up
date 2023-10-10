import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { connect, Connection } from 'mongoose';

let mongoServer: MongoMemoryServer;
let mongoConnection: Connection;

mongoose.set('strictQuery', false);

export const dbConnect = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  mongoConnection = (await connect(uri)).connection;

  return mongoConnection;
};

export const dbDisconnect = async () => {
  await mongoConnection.dropDatabase();
  await mongoConnection.close();
  await mongoServer.stop();
};
