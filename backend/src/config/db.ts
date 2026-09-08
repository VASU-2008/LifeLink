import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  try {
    if (uri && !uri.includes('localhost:27017')) {
      // Direct remote/custom MongoDB connection
      await mongoose.connect(uri);
      console.log(`[MongoDB] Connected to remote database: ${mongoose.connection.host}`);
      return;
    }

    // Attempt local MongoDB first with 2.5s timeout
    try {
      const localUri = uri || 'mongodb://localhost:27017/lifelink';
      await mongoose.connect(localUri, { serverSelectionTimeoutMS: 2500 });
      console.log(`[MongoDB] Connected to local database: ${mongoose.connection.host}`);
    } catch (localErr) {
      console.log('[MongoDB] Local MongoDB daemon not found. Starting embedded In-Memory MongoDB Server...');
      mongod = await MongoMemoryServer.create();
      const inMemoryUri = mongod.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`[MongoDB] Connected to embedded in-memory MongoDB: ${inMemoryUri}`);
    }
  } catch (error) {
    console.error('[MongoDB] Connection error:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
    console.log('[MongoDB] Disconnected successfully');
  } catch (error) {
    console.error('[MongoDB] Disconnect error:', error);
  }
};
