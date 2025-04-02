import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max number of requests per window
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

const defaultConfig = (maxRequests: number): RateLimitConfig => ({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: maxRequests, // Max requests per window
});

export const rateLimit = (config: Partial<RateLimitConfig> = {}) => {
  const { windowMs = 15 * 60 * 1000, max = 100 } = { ...defaultConfig(100), ...config };

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get IP address from request, fallback to a default if not available
      const key = req.ip || req.socket.remoteAddress || 'unknown';
      const now = Date.now();

      // Initialize or reset if window has passed
      if (!store[key] || now > store[key].resetTime) {
        store[key] = {
          count: 0,
          resetTime: now + windowMs,
        };
      }

      // Increment count
      store[key].count++;

      // Check if limit exceeded
      if (store[key].count > max) {
        throw new AppError('Too many requests, please try again later.', 429);
      }

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - store[key].count));
      res.setHeader('X-RateLimit-Reset', store[key].resetTime);

      next();
    } catch (error) {
      next(error);
    }
  };
}; 