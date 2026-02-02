import redis from '../config/redis.config';

export class CacheService {
  private static readonly DEFAULT_TTL = 3600; // 1 hour in seconds

  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  static async set(key: string, value: any, ttl: number = this.DEFAULT_TTL): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      await redis.setex(key, ttl, serialized);
      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  static async delete(key: string): Promise<boolean> {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  static async deletePattern(pattern: string): Promise<boolean> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error(`Cache delete pattern error for ${pattern}:`, error);
      return false;
    }
  }

  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  static async getTTL(key: string): Promise<number> {
    try {
      return await redis.ttl(key);
    } catch (error) {
      console.error(`Cache TTL error for key ${key}:`, error);
      return -1;
    }
  }

  static async increment(key: string, amount: number = 1): Promise<number> {
    try {
      return await redis.incrby(key, amount);
    } catch (error) {
      console.error(`Cache increment error for key ${key}:`, error);
      return 0;
    }
  }

  static async setHash(key: string, field: string, value: any): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      await redis.hset(key, field, serialized);
      return true;
    } catch (error) {
      console.error(`Cache hash set error for key ${key}:`, error);
      return false;
    }
  }

  static async getHash<T>(key: string, field: string): Promise<T | null> {
    try {
      const data = await redis.hget(key, field);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`Cache hash get error for key ${key}:`, error);
      return null;
    }
  }

  static async getAllHash<T>(key: string): Promise<Record<string, T> | null> {
    try {
      const data = await redis.hgetall(key);
      if (!data || Object.keys(data).length === 0) return null;
      
      const result: Record<string, T> = {};
      for (const [field, value] of Object.entries(data)) {
        if (typeof value === 'string') {
          result[field] = JSON.parse(value) as T;
        }
      }
      return result;
    } catch (error) {
      console.error(`Cache hash getall error for key ${key}:`, error);
      return null;
    }
  }

  static async flush(): Promise<boolean> {
    try {
      await redis.flushdb();
      return true;
    } catch (error) {
      console.error('Cache flush error:', error);
      return false;
    }
  }
}

export default CacheService;
