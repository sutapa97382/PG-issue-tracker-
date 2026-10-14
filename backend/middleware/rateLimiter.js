import rateLimit from 'express-rate-limit';

/**
 * Global API Rate Limiter
 * Restricts general traffic to 200 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true, // Return standard RateLimit headers (Draft-6/Draft-7)
  legacyHeaders: false, // Disable X-RateLimit-* headers
  message: {
    success: false,
    message: 'Too many requests from this IP address. Please try again after 15 minutes.',
  },
});

/**
 * Strict Auth Rate Limiter
 * Protects login and signup from brute-force password & key guessing
 * 5 failed attempts per 15 minutes per IP (successful logins do not count)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 failed attempts allowed
  skipSuccessfulRequests: true, // Only count failed attempts (wrong password/secret key)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many failed login attempts (5 attempts exceeded). Account temporarily locked. Please try again after 15 minutes.',
  },
});

/**
 * Maintenance Ticket Creation Limiter
 * Protects against ticket spamming (max 10 new issues in 10 minutes)
 */
export const createIssueLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'You have submitted too many maintenance issues recently. Please wait a few minutes.',
  },
});
