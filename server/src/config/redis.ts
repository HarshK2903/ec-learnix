import Redis from 'ioredis';
import { env } from './env.js';

const isUpstash = env.REDIS_URL?.includes('upstash.io');
const isTLS = env.REDIS_URL?.startsWith('rediss://');

// Base Redis options optimized for Upstash + BullMQ
const baseOptions: Record<string, unknown> = {
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
  family: 4, // Force IPv4 (Upstash works better with IPv4)
  keepAlive: 10000, // Aggressive keepalive to prevent Upstash idle drops
  connectTimeout: 15000,
  // Upstash-specific: prevent command timeout during reconnection
  enableOfflineQueue: true,
  retryStrategy(times: number) {
    if (times > 20) {
      console.error('❌ Redis: Max reconnection attempts reached');
      return null; // Stop retrying
    }
    // Exponential backoff: 200ms, 400ms, 800ms... capped at 5s
    return Math.min(times * 200, 5000);
  },
  reconnectOnError(err: Error) {
    return err.message.includes('ECONNRESET') || err.message.includes('READONLY');
  },
};

// TLS config for Upstash (rediss:// URLs)
if (isTLS) {
  baseOptions.tls = {
    rejectUnauthorized: false,
    // Upstash requires SNI for TLS
    ...(isUpstash ? { servername: new URL(env.REDIS_URL).hostname } : {}),
  };
}

let connectionCount = 0;

/**
 * Create a new Redis connection instance.
 * BullMQ requires SEPARATE connections for Queue and Worker
 * because Workers use blocking Redis commands (BRPOPLPUSH).
 */
export function createRedisConnection(label?: string): Redis {
  const id = ++connectionCount;
  const tag = label || `conn-${id}`;
  let hasConnected = false;

  const conn = env.REDIS_URL
    ? new Redis(env.REDIS_URL, baseOptions)
    : new Redis({
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        ...baseOptions,
      });

  conn.on('connect', () => {
    if (!hasConnected) {
      console.log(`✅ Redis [${tag}] connected`);
      hasConnected = true;
    }
  });

  conn.on('error', (err) => {
    // Silently handle ECONNRESET (auto-recovered by reconnect strategy)
    if (err.message.includes('ECONNRESET')) return;
    console.error(`❌ Redis [${tag}] error:`, err.message);
  });

  conn.on('close', () => {
    hasConnected = false; // Allow re-logging on next successful connect
  });

  return conn;
}

// Default shared connection (for non-BullMQ use)
export const redis = createRedisConnection('default');

export default redis;
