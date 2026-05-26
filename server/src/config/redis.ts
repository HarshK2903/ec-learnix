import Redis from 'ioredis';
import { env } from './env.js';

// Base Redis options with connection resilience settings
const baseOptions: Record<string, unknown> = {
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
  keepAlive: 30000, // Send TCP keepalive every 30s to prevent idle disconnects
  connectTimeout: 10000,
  retryStrategy(times: number) {
    // Exponential backoff: 50ms, 100ms, 200ms... capped at 2s
    return Math.min(times * 50, 2000);
  },
  reconnectOnError(err: Error) {
    // Reconnect on connection reset errors
    return err.message.includes('ECONNRESET') || err.message.includes('READONLY');
  },
};

// Add TLS if using rediss:// URL
if (env.REDIS_URL && env.REDIS_URL.startsWith('rediss://')) {
  baseOptions.tls = { rejectUnauthorized: false };
}

/**
 * Create a new Redis connection instance.
 * BullMQ requires SEPARATE connections for Queue and Worker
 * because Workers use blocking Redis commands (BRPOPLPUSH).
 */
export function createRedisConnection(): Redis {
  const conn = env.REDIS_URL
    ? new Redis(env.REDIS_URL, baseOptions)
    : new Redis({
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        ...baseOptions,
      });

  conn.on('connect', () => {
    console.log('✅ Redis connected successfully');
  });

  conn.on('error', (err) => {
    console.error('❌ Redis connection error:', err.message);
  });

  return conn;
}

// Default shared connection (for non-BullMQ use, e.g. caching)
export const redis = createRedisConnection();

export default redis;
