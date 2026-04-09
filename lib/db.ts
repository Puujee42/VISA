import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

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

/**
 * Returns true when the existing cached connection is no longer usable —
 * i.e. after an ECONNRESET or Atlas idle-timeout drops the TCP socket.
 */
function isConnectionStale(): boolean {
  const state = mongoose.connection.readyState;
  // 0 = disconnected, 3 = disconnecting
  return state === 0 || state === 3;
}

const CONNECT_OPTS: mongoose.ConnectOptions = {
  // How long the driver waits when picking a server before throwing
  serverSelectionTimeoutMS: 10_000,
  // How long a single TCP connect attempt may take
  connectTimeoutMS: 10_000,
  // How long an idle socket may sit before the driver closes it
  socketTimeoutMS: 45_000,
  // Allow Mongoose to buffer ops briefly while re-establishing
  bufferCommands: true,
  // Shrink the pool so free-tier M0 doesn't hit connection limits
  maxPoolSize: 5,
  minPoolSize: 1,
};

export async function connectToDB(): Promise<typeof mongoose> {
  // Fast path — connection is healthy
  if (cached.conn && !isConnectionStale()) {
    return cached.conn;
  }

  // If the TCP connection was dropped (ECONNRESET / idle timeout), reset state
  // so the next call below re-creates the connection from scratch.
  if (isConnectionStale() && cached.conn) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, CONNECT_OPTS)
      .then((m) => {
        // Attach one-time listeners so future resets clear the cache
        m.connection.on("disconnected", () => {
          cached.conn = null;
          cached.promise = null;
        });
        m.connection.on("error", () => {
          cached.conn = null;
          cached.promise = null;
        });
        return m;
      })
      .catch((err) => {
        // Allow the next call to retry
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

/**
 * Thin wrapper that retries once on transient network errors
 * (ECONNRESET, MongoNetworkError, MongoServerSelectionError).
 *
 * Usage:
 *   await connectToDBWithRetry();
 *   const doc = await MyModel.findById(id).lean();
 */
export async function connectToDBWithRetry(
  maxAttempts = 2,
): Promise<typeof mongoose> {
  let lastErr: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await connectToDB();
    } catch (err: any) {
      lastErr = err;

      const isTransient =
        err?.name === "MongoNetworkError" ||
        err?.name === "MongoServerSelectionError" ||
        err?.code === "ECONNRESET" ||
        String(err?.cause?.code) === "ECONNRESET" ||
        String(err?.message).includes("ECONNRESET") ||
        String(err?.message).includes("connect ETIMEDOUT");

      if (!isTransient || attempt >= maxAttempts) {
        throw err;
      }

      // Brief back-off before the retry (exponential: 300 ms, 600 ms, …)
      await new Promise((r) => setTimeout(r, 300 * attempt));

      // Ensure stale cache is cleared before retrying
      cached.conn = null;
      cached.promise = null;
    }
  }

  throw lastErr;
}

export default connectToDBWithRetry;
