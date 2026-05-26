import { Queue } from 'bullmq';
import { createRedisConnection } from '../config/redis.js';

export const processingQueue = new Queue('document-processing', {
  connection: createRedisConnection('queue'),
  defaultJobOptions: {
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

processingQueue.on('error', (err) => {
  console.error('❌ Queue error:', err.message);
});

console.log('📋 BullMQ processing queue initialized');
