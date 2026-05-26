import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      // Connection pool — reuse connections instead of creating new ones
      maxPoolSize: 10,
      minPoolSize: 2,
      // Timeouts to prevent hanging
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      // Buffering — queue operations during brief disconnects
      bufferCommands: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};
