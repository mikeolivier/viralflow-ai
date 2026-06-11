import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  db: 0,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

export class CacheService {
  private static instance: CacheService;

  private constructor() {}

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    try {
      const ttl = options?.ttl || 3600; // Default 1 hour
      const prefixedKey = options?.prefix ? `${options.prefix}:${key}` : key;
      await redis.setex(prefixedKey, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async delete(key: string, prefix?: string): Promise<void> {
    try {
      const prefixedKey = prefix ? `${prefix}:${key}` : key;
      await redis.del(prefixedKey);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidate pattern error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      await redis.flushdb();
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  // Decorator for caching function results
  static memoize<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    options?: CacheOptions
  ): T {
    return (async (...args: any[]) => {
      const cache = CacheService.getInstance();
      const cacheKey = `${fn.name}:${JSON.stringify(args)}`;

      // Try to get from cache
      const cached = await cache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Execute function
      const result = await fn(...args);

      // Store in cache
      await cache.set(cacheKey, result, options);

      return result;
    }) as T;
  }
}

export const cacheService = CacheService.getInstance();
