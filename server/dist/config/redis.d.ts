import { type RedisOptions } from 'ioredis';
/**
 * Parsed connection options for BullMQ (do not share one ioredis instance).
 */
export declare function getBullMQConnection(): RedisOptions;
/** Fail fast on boot with a clear message if Redis is unreachable or misconfigured. */
export declare function assertRedisReachable(): Promise<void>;
/** Attach to BullMQ Queue / Worker so connection errors are not thrown as uncaught exceptions. */
export declare function attachBullMQErrorHandlers(emitter: {
    on(event: 'error', handler: (err: Error) => void): void;
}, label: string): void;
//# sourceMappingURL=redis.d.ts.map