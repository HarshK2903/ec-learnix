import Redis from 'ioredis';
/** BullMQ needs separate connections for Queue (commands) and Worker (blocking). */
export declare function createRedisConnection(label: string): Redis;
export declare const redisQueue: Redis;
export declare const redisWorker: Redis;
/** @deprecated Use redisQueue or redisWorker — kept for any legacy imports */
export declare const redis: Redis;
export default redisQueue;
//# sourceMappingURL=redis.d.ts.map