import { Queue } from 'bullmq';
import { redis } from '../config/redis.js';

export const processingQueue = new Queue('document-processing', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

console.log('📋 BullMQ processing queue initialized');
