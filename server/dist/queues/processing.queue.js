import { Queue } from 'bullmq';
import { attachBullMQErrorHandlers, getBullMQConnection } from '../config/redis.js';
let processingQueue = null;
export function getProcessingQueue() {
    if (!processingQueue) {
        processingQueue = new Queue('document-processing', {
            connection: getBullMQConnection(),
            defaultJobOptions: {
                removeOnComplete: { count: 100 },
                removeOnFail: { count: 50 },
            },
        });
        attachBullMQErrorHandlers(processingQueue, 'queue');
        console.log('📋 BullMQ processing queue initialized');
    }
    return processingQueue;
}
//# sourceMappingURL=processing.queue.js.map