import rateLimit from 'express-rate-limit';
// General API rate limit: 100 requests per 15 minutes
export const apiRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});
// Auth rate limit: 10 attempts per 15 minutes
export const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: 'Too many auth attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});
//# sourceMappingURL=rateLimit.middleware.js.map