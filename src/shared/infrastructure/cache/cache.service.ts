import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

export interface CacheOptions {
  ttl?: number; // seconds
  prefix?: string;
}

/**
 * High-level caching service built on top of Redis
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly defaultTtl = 3600; // 1 hour
  private readonly keyPrefix = 'cache:';

  constructor(private readonly redis: RedisService) {}

  /**
   * Build a cache key with prefix
   */
  private buildKey(key: string, prefix?: string): string {
    return `${this.keyPrefix}${prefix ? prefix + ':' : ''}${key}`;
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string, prefix?: string): Promise<T | null> {
    const cacheKey = this.buildKey(key, prefix);
    return this.redis.getJson<T>(cacheKey);
  }

  /**
   * Set a value in cache
   */
  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {},
  ): Promise<void> {
    const cacheKey = this.buildKey(key, options.prefix);
    await this.redis.setJson(cacheKey, value, options.ttl || this.defaultTtl);
  }

  /**
   * Delete a value from cache
   */
  async del(key: string, prefix?: string): Promise<void> {
    const cacheKey = this.buildKey(key, prefix);
    await this.redis.del(cacheKey);
  }

  /**
   * Check if a key exists
   */
  async exists(key: string, prefix?: string): Promise<boolean> {
    const cacheKey = this.buildKey(key, prefix);
    return this.redis.exists(cacheKey);
  }

  /**
   * Get or set pattern - returns cached value or executes factory
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options: CacheOptions = {},
  ): Promise<T> {
    const cacheKey = this.buildKey(key, options.prefix);
    return this.redis.getOrSet(
      cacheKey,
      factory,
      options.ttl || this.defaultTtl,
    );
  }

  /**
   * Invalidate all keys matching a pattern
   */
  async invalidate(pattern: string): Promise<void> {
    const cachePattern = `${this.keyPrefix}${pattern}*`;
    await this.redis.invalidatePattern(cachePattern);
    this.logger.log(`Cache invalidated: ${cachePattern}`);
  }

  /**
   * Invalidate all keys with a specific prefix
   */
  async invalidatePrefix(prefix: string): Promise<void> {
    await this.invalidate(`${prefix}:`);
  }

  // ============================================
  // Domain-Specific Cache Methods
  // ============================================

  /**
   * Cache course catalog
   */
  async getCachedCourses<T>(factory: () => Promise<T>): Promise<T> {
    return this.getOrSet('catalog:all', factory, {
      ttl: 300,
      prefix: 'courses',
    }); // 5 min
  }

  /**
   * Cache course detail
   */
  async getCachedCourse<T>(
    courseId: string,
    factory: () => Promise<T>,
  ): Promise<T> {
    return this.getOrSet(`detail:${courseId}`, factory, {
      ttl: 600,
      prefix: 'courses',
    }); // 10 min
  }

  /**
   * Invalidate course cache
   */
  async invalidateCourseCache(courseId?: string): Promise<void> {
    await this.invalidate('courses:catalog');
    if (courseId) {
      await this.del(`detail:${courseId}`, 'courses');
    }
  }

  /**
   * Cache leaderboard
   */
  async getCachedLeaderboard<T>(
    type: string,
    factory: () => Promise<T>,
  ): Promise<T> {
    return this.getOrSet(`leaderboard:${type}`, factory, { ttl: 60 }); // 1 min
  }

  /**
   * Cache user session data
   */
  async getCachedUserSession<T>(
    userId: string,
    factory: () => Promise<T>,
  ): Promise<T> {
    return this.getOrSet(`session:${userId}`, factory, {
      ttl: 1800,
      prefix: 'user',
    }); // 30 min
  }

  /**
   * Invalidate user session cache
   */
  async invalidateUserSession(userId: string): Promise<void> {
    await this.del(`session:${userId}`, 'user');
  }

  /**
   * Cache class roster
   */
  async getCachedClassRoster<T>(
    classId: string,
    factory: () => Promise<T>,
  ): Promise<T> {
    return this.getOrSet(`roster:${classId}`, factory, {
      ttl: 300,
      prefix: 'class',
    }); // 5 min
  }

  /**
   * Invalidate class cache
   */
  async invalidateClassCache(classId: string): Promise<void> {
    await this.invalidate(`class:roster:${classId}`);
  }
}
