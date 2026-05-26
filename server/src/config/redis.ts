import Redis, { RedisOptions } from 'ioredis';
import { env } from './env.js';

/**
 * Build Redis connection options.
 * Supports two modes:
 *   1. REDIS_URL (e.g. rediss://default:pass@host:port) — used as-is
 *   2. Individual vars: REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_TLS
 */
function buildRedisOptions(): { url?: string; opts: RedisOptions } {
  const common: RedisOptions = {
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: true,
    keepAlive: 10000,
    connectTimeout: 15000,
    retryStrategy(times: number) {
      if (times > 30) return null; // Give up after 30 retries
      return Math.min(times * 500, 10000);
    },
  };

  // Mode 1: Full URL provided
  if (env.REDIS_URL) {
    const useTLS = env.REDIS_URL.startsWith('rediss://');
    if (useTLS) {
      common.tls = { rejectUnauthorized: false };
    }
    return { url: env.REDIS_URL, opts: common };
  }

  // Mode 2: Individual vars (host/port/password/tls)
  const opts: RedisOptions = {
    ...common,
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  };

  if (env.REDIS_PASSWORD) {
    opts.password = env.REDIS_PASSWORD;
  }

  if (env.REDIS_TLS) {
    opts.tls = { rejectUnauthorized: false };
  }

  return { opts };
}

const redisConfig = buildRedisOptions();

// Log connection info (masked) for debugging
if (redisConfig.url) {
  const masked = redisConfig.url.replace(/:\/\/[^@]+@/, '://***:***@');
  console.log(`🔗 Redis: ${masked}`);
} else {
  console.log(`🔗 Redis: ${env.REDIS_HOST}:${env.REDIS_PORT} (TLS: ${env.REDIS_TLS})`);
}

/**
 * Create a new Redis connection.
 * BullMQ needs SEPARATE connections for Queue and Worker.
 */
export function createRedisConnection(label?: string): Redis {
  const tag = label || 'redis';

  const conn = redisConfig.url
    ? new Redis(redisConfig.url, redisConfig.opts)
    : new Redis(redisConfig.opts);

  conn.once('ready', () => {
    console.log(`✅ Redis [${tag}] ready`);
  });

  conn.on('error', (err) => {
    if (err.message.includes('ECONNRESET')) return; // Handled by auto-reconnect
    console.error(`❌ Redis [${tag}] error:`, err.message);
  });

  return conn;
}

// Default connection for non-BullMQ use
export const redis = createRedisConnection('default');
export default redis;
