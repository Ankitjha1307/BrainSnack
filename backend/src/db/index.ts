import mongoose from 'mongoose';
import { config } from '../config/index';

/**
 * Connect to MongoDB (Mongoose). The connection string comes from
 * `config.database.uri`, which reads the `MONGODB_URI` environment variable and
 * falls back to the mock local URI defined in `src/config/index.ts`.
 */
export const connectDatabase = async (): Promise<typeof mongoose> => {
  mongoose.set('strictQuery', true);

  await mongoose.connect(config.database.uri, {
    serverSelectionTimeoutMS: config.database.connectTimeoutMs,
  });

  if (config.nodeEnv === 'development') {
    const host = mongoose.connection.host ?? 'unknown-host';
    const name = mongoose.connection.name ?? 'unknown-db';
    console.log(`MongoDB connected: ${host}/${name}`);
  }

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
  });

  return mongoose;
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
};

/** Cheap liveness probe used by `/health` and `/api/status`. */
export const pingDatabase = async (): Promise<{ ok: true } | { ok: false; error: string }> => {
  try {
    if (!mongoose.connection.db) {
      throw new Error('MongoDB is not connected');
    }
    await mongoose.connection.db.admin().ping();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Unknown database error' };
  }
};

export default mongoose;
