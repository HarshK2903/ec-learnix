import Redis, { type RedisOptions } from 'ioredis';
import { env } from './env.js';

const TRANSIENT_ERROR_CODES = new Set(['ECONNRESET', 'ETIMEDOUT', 'EPIPE', 'ECONNREFUSED']);

function maskRedisUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.password) parsed.password = '****';
    return parsed.toString();
  } catch {
    return '(invalid URL)';
  }
}

function tlsFromHost(host: string): boolean {
  return env.REDIS_TLS || host.includes('upstash.io');
}

/**
 * Parsed connection options for BullMQ (do not share one ioredis instance).
 */
export function getBullMQConnection(): RedisOptions {
  const base: RedisOptions = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    connectTimeout: 20_000,
    family: 4,
    keepAlive: 30_000,
    retryStrategy: (times) => {
      if (times > 20) return null;
      return Math.min(times * 300, 5_000);
    },
    reconnectOnError: (err) => {
      const code = (err as NodeJS.ErrnoException).code;
      return code !== undefined && TRANSIENT_ERROR_CODES.has(code);
    },
  };

  if (env.REDIS_URL) {
    const parsed = new URL(env.REDIS_URL);
    const useTls = parsed.protocol === 'rediss:' || tlsFromHost(parsed.hostname);

    return {
      ...base,
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : 6379,
      username: parsed.username ? decodeURIComponent(parsed.username) : undefined,
      password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
      ...(useTls ? { tls: { rejectUnauthorized: false } } : {}),
    };
  }

  const useTls = tlsFromHost(env.REDIS_HOST);

  return {
    ...base,
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    username: env.REDIS_PASSWORD ? env.REDIS_USERNAME : undefined,
    password: env.REDIS_PASSWORD || undefined,
    ...(useTls ? { tls: { rejectUnauthorized: false } } : {}),
  };
}

function hasRedisConfig(): boolean {
  return Boolean(env.REDIS_URL || env.REDIS_HOST);
}

function logRedisTarget(): void {
  if (env.REDIS_URL) {
    const scheme = env.REDIS_URL.startsWith('rediss://') ? 'rediss' : 'redis';
    console.log(`   Redis: ${scheme} → ${maskRedisUrl(env.REDIS_URL)}`);
    return;
  }
  const tls = tlsFromHost(env.REDIS_HOST) ? 'TLS' : 'no TLS';
  console.log(`   Redis: ${env.REDIS_HOST}:${env.REDIS_PORT} (${tls}, user=${env.REDIS_USERNAME})`);
}

function logRedisError(label: string, err: NodeJS.ErrnoException): void {
  if (err.code && TRANSIENT_ERROR_CODES.has(err.code)) {
    console.warn(`Redis [${label}]: ${err.code}`);
    return;
  }
  console.error(`Redis [${label}]:`, err.message);
}

/** Fail fast on boot with a clear message if Redis is unreachable or misconfigured. */
export async function assertRedisReachable(): Promise<void> {
  if (env.NODE_ENV === 'production' && !hasRedisConfig()) {
    throw new Error(
      'Redis is not configured. Set REDIS_URL (recommended) or REDIS_HOST + REDIS_PASSWORD + REDIS_TLS=true for Upstash.'
    );
  }

  if (env.REDIS_HOST.includes('upstash.io') && !env.REDIS_URL && !env.REDIS_PASSWORD) {
    throw new Error(
      'Upstash requires REDIS_PASSWORD (or a full REDIS_URL). Copy the Redis URL from Upstash Console → Connect.'
    );
  }

  if (env.REDIS_HOST.includes('upstash.io') && !env.REDIS_URL && !env.REDIS_TLS) {
    console.warn('⚠️  Upstash usually needs REDIS_TLS=true (or use rediss:// in REDIS_URL).');
  }

  const client = new Redis(getBullMQConnection());

  client.on('error', (err: NodeJS.ErrnoException) => logRedisError('startup', err));

  try {
    const pong = await client.ping();
    console.log(`✅ Redis reachable (${pong})`);
    logRedisTarget();
  } catch (err) {
    console.error('❌ Cannot connect to Redis.');
    logRedisTarget();
    console.error(
      '   Upstash: use the full URL from Console → Redis → Connect → Node/ioredis, e.g. rediss://default:PASSWORD@host:6379'
    );
    throw err;
  } finally {
    client.disconnect();
  }
}

/** Attach to BullMQ Queue / Worker so connection errors are not thrown as uncaught exceptions. */
export function attachBullMQErrorHandlers(
  emitter: { on(event: 'error', handler: (err: Error) => void): void },
  label: string
): void {
  emitter.on('error', (err) => logRedisError(label, err as NodeJS.ErrnoException));
}
