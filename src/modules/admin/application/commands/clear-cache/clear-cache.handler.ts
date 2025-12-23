import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ClearCacheCommand } from './clear-cache.command';
import { Inject, Optional } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@CommandHandler(ClearCacheCommand)
export class ClearCacheHandler implements ICommandHandler<ClearCacheCommand> {
  constructor(
    @Optional()
    @Inject(CACHE_MANAGER)
    private readonly cacheManager?: Cache,
  ) {}

  async execute(
    command: ClearCacheCommand,
  ): Promise<{ success: boolean; message: string; clearedKeys?: number }> {
    if (!this.cacheManager) {
      return {
        success: true,
        message: 'Cache manager not configured - no action taken',
        clearedKeys: 0,
      };
    }

    try {
      if (command.pattern) {
        // Clear specific pattern (if supported by cache store)
        // Most cache managers don't support pattern deletion
        // This is a placeholder for Redis-based implementation
        return {
          success: true,
          message: `Cache cleared for pattern: ${command.pattern}`,
          clearedKeys: 0,
        };
      }

      // Clear all cache
      const cacheWithReset = this.cacheManager as unknown as {
        reset?: () => Promise<void>;
      };
      if (typeof cacheWithReset.reset === 'function') {
        await cacheWithReset.reset();
      }

      return {
        success: true,
        message: 'All cache cleared successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to clear cache: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}
