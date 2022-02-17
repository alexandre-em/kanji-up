import mongoose, {Connection} from 'mongoose';
import dotenv from 'dotenv';

export async function connectToDatabase(): Promise<void> {
  dotenv.config();
  const uri = process.env.MONGO_URI;
  return mongoose.connect(uri, {}, (err) => {
    if (err) {
      console.log('Connection to the database failed');
    } else {
      console.log('Connection to the database is successful')
    }
  });
}

const db: Connection = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDb connection error'));

export default connectToDatabase;

