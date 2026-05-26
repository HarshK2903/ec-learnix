import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

// General API rate limit: generous in dev, stricter in production
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === 'production' ? 500 : 5000, // basically unlimited in dev
  message: { message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'development', // skip rate limiting in dev
});

// Auth rate limit: 20 attempts per 15 minutes
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'Too many auth attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
