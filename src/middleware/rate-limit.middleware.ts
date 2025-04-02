import { Request, Response, NextFunction } from 'express';
import { CacheService } from '../services/cache.service';
import { AppError } from './error.middleware';

const cacheService = new CacheService();

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max number of requests per window
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
};

export const rateLimit = (config: Partial<RateLimitConfig> = {}) => {
  const { windowMs, max } = { ...defaultConfig, ...config };

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = cacheService.generateKey('rate-limit', req.ip);
      const current = await cacheService.get<number>(key) || 0;

      if (current >= max) {
        throw new AppError('Too many requests, please try again later.', 429);
      }

      await cacheService.set(key, current + 1, Math.ceil(windowMs / 1000));
      next();
    } catch (error) {
      next(error);
    }
  };
}; 