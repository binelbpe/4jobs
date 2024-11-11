"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.twilioRateLimit = void 0;
const store = {};
const twilioRateLimit = (req, res, next) => {
    const clientIp = req.ip || 'unknown';
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const max = 100; // max requests per window
    // Clean up old entries
    if (store[clientIp] && store[clientIp].resetTime < now) {
        delete store[clientIp];
    }
    // Initialize or update store
    if (!store[clientIp]) {
        store[clientIp] = {
            count: 1,
            resetTime: now + windowMs
        };
    }
    else {
        store[clientIp].count++;
    }
    // Check limit
    if (store[clientIp].count > max) {
        return res.status(429).json({
            error: 'Too many requests',
            retryAfter: Math.ceil((store[clientIp].resetTime - now) / 1000),
            message: 'Please try again later'
        });
    }
    // Add headers
    res.set({
        'X-RateLimit-Limit': max.toString(),
        'X-RateLimit-Remaining': (max - store[clientIp].count).toString(),
        'X-RateLimit-Reset': Math.ceil(store[clientIp].resetTime / 1000).toString()
    });
    next();
};
exports.twilioRateLimit = twilioRateLimit;
