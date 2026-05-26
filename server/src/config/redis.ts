import Redis from 'ioredis';
import { env } from './env.js';

// Support REDIS_URL (for managed Redis like Render/Upstash) or fallback to host/port
const redisOptions = env.REDIS_URL
  ? {
      maxRetriesPerRequest: null,
      tls: env.REDIS_URL.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
    }
  : {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      maxRetriesPerRequest: null,
    };

export const redis = env.REDIS_URL
  ? new Redis(env.REDIS_URL, redisOptions)
  : new Redis(redisOptions);

redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

export default redis;
