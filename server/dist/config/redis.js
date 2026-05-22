import Redis from 'ioredis';
import { env } from './env.js';
const TRANSIENT_ERROR_CODES = new Set(['ECONNRESET', 'ETIMEDOUT', 'EPIPE', 'ECONNREFUSED']);
function buildRedisOptions() {
    const useTls = Boolean(env.REDIS_URL?.startsWith('rediss://'));
    return {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        enableOfflineQueue: true,
        connectTimeout: 20_000,
        keepAlive: 30_000,
        retryStrategy: (times) => {
            if (times > 30)
                return null;
            return Math.min(times * 200, 5_000);
        },
        reconnectOnError: (err) => {
            const code = err.code;
            return code !== undefined && TRANSIENT_ERROR_CODES.has(code);
        },
        ...(useTls ? { tls: { rejectUnauthorized: false } } : {}),
        ...(!env.REDIS_URL
            ? {
                host: env.REDIS_HOST,
                port: env.REDIS_PORT,
            }
            : {}),
    };
}
function attachRedisListeners(client, label) {
    let hasLoggedReady = false;
    client.on('ready', () => {
        if (!hasLoggedReady) {
            console.log(`✅ Redis [${label}] ready`);
            hasLoggedReady = true;
        }
    });
    client.on('reconnecting', () => {
        console.warn(`Redis [${label}]: reconnecting…`);
    });
    client.on('error', (err) => {
        if (err.code && TRANSIENT_ERROR_CODES.has(err.code)) {
            console.warn(`Redis [${label}]: ${err.code} (will retry)`);
            return;
        }
        console.error(`Redis [${label}]:`, err.message);
    });
}
/** BullMQ needs separate connections for Queue (commands) and Worker (blocking). */
export function createRedisConnection(label) {
    const options = buildRedisOptions();
    const client = env.REDIS_URL
        ? new Redis(env.REDIS_URL, options)
        : new Redis(options);
    attachRedisListeners(client, label);
    return client;
}
export const redisQueue = createRedisConnection('queue');
export const redisWorker = createRedisConnection('worker');
/** @deprecated Use redisQueue or redisWorker — kept for any legacy imports */
export const redis = redisQueue;
export default redisQueue;
//# sourceMappingURL=redis.js.map