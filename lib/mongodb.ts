import mongoose from "mongoose";

const getMongoUri = () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set in environment");
  }
  return uri;
};

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongooseCache ?? {
  conn: null,
  promise: null,
};
global._mongooseCache = cached;

function isConnectionStale(): boolean {
  const state = mongoose.connection.readyState;
  return state === 0 || state === 3;
}

const CONNECT_OPTS: mongoose.ConnectOptions = {
  serverSelectionTimeoutMS: 10_000,
  connectTimeoutMS: 10_000,
  socketTimeoutMS: 45_000,
  bufferCommands: true,
  maxPoolSize: 5,
  minPoolSize: 1,
};

export async function connectToDB(): Promise<typeof mongoose> {
  if (cached.conn && !isConnectionStale()) {
    return cached.conn;
  }

  if (isConnectionStale()) {
    cached.conn = null;
    cached.promise = null;
    try {
      await mongoose.disconnect();
    } catch {
      /* ignore */
    }
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(getMongoUri(), CONNECT_OPTS);
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    throw error;
  }
}

export async function connectToDBWithRetry(maxAttempts = 2) {
  let lastError: unknown;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await connectToDB();
    } catch (error) {
      lastError = error;
      cached.promise = null;
      cached.conn = null;
    }
  }
  throw lastError;
}

export default connectToDBWithRetry;
