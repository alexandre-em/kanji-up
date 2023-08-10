import mongoose, { Connection } from 'mongoose';
import { injectUUID } from 'mongoose-uuid-parser';
import dotenv from 'dotenv';

injectUUID(mongoose);

export async function connectToDatabase(): Promise<void> {
  dotenv.config();
  const uri = `${process.env.MONGO_URI}/kanji?retryWrites=true&w=majority`;
  console.log(`Trying to connect to database: ${uri}`);
  return mongoose.connect(uri || '', {}, (err) => {
    if (err) {
      console.log('Connection to the database failed');
    } else {
      console.log('Connection to the database is successful');
    }
  });
}

const db: Connection = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDb connection error'));

export default connectToDatabase;
