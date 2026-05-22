import { Queue } from 'bullmq';
import { redisQueue } from '../config/redis.js';
export const processingQueue = new Queue('document-processing', {
    connection: redisQueue,
    defaultJobOptions: {
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
    },
});
console.log('📋 BullMQ processing queue initialized');
//# sourceMappingURL=processing.queue.js.map