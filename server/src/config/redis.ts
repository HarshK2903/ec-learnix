import Redis from 'ioredis';
import { env } from './env.js';

const isTLS = env.REDIS_URL?.startsWith('rediss://');
const isUpstash = env.REDIS_URL?.includes('upstash.io');

// Log constructed URL (masked) for debugging
if (env.REDIS_URL) {
  const masked = env.REDIS_URL.replace(/:\/\/[^@]+@/, '://***:***@');
  console.log(`🔗 Redis URL: ${masked} (TLS: ${isTLS})`);
} else {
  console.warn('⚠️  No REDIS_URL configured — using localhost');
}

// Base Redis options optimized for Upstash + BullMQ
const baseOptions: Record<string, unknown> = {
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
  family: 4, // Force IPv4 (Upstash works better with IPv4)
  keepAlive: 10000, // Aggressive keepalive to prevent Upstash idle drops
  connectTimeout: 15000,
  enableOfflineQueue: true,
  retryStrategy(times: number) {
    // Exponential backoff: 500ms, 1s, 2s, 4s, 5s (capped)
    return Math.min(times * 500, 5000);
  },
  reconnectOnError(err: Error) {
    return err.message.includes('ECONNRESET') || err.message.includes('READONLY');
  },
};

// TLS config for Upstash (rediss:// URLs)
if (isTLS) {
  baseOptions.tls = {
    rejectUnauthorized: false,
    ...(isUpstash ? { servername: new URL(env.REDIS_URL).hostname } : {}),
  };
}

/**
 * Create a new Redis connection instance.
 * BullMQ requires SEPARATE connections for Queue and Worker
 * because Workers use blocking Redis commands (BRPOPLPUSH).
 */
export function createRedisConnection(label?: string): Redis {
  const tag = label || 'redis';

  const conn = env.REDIS_URL
    ? new Redis(env.REDIS_URL, baseOptions)
    : new Redis({
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        ...baseOptions,
      });

  // Only log once on first successful ready
  conn.once('ready', () => {
    console.log(`✅ Redis [${tag}] ready`);
  });

  conn.on('error', (err) => {
    // Silently handle ECONNRESET (auto-recovered by reconnect strategy)
    if (err.message.includes('ECONNRESET')) return;
    console.error(`❌ Redis [${tag}] error:`, err.message);
  });

  return conn;
}

// Default shared connection (for non-BullMQ use)
export const redis = createRedisConnection('default');

export default redis;
