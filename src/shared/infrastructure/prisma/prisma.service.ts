import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Database connection established');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Database connection closed');
  }

  /**
   * Health check for database connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clean database (for testing only)
   * WARNING: This will delete all data!
   */
  async cleanDatabase(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    // Get all model names from Prisma client
    const modelNames = Object.keys(this).filter(
      (key) =>
        !key.startsWith('_') &&
        !key.startsWith('$') &&
        typeof (this as Record<string, unknown>)[key] === 'object',
    );

    // Delete data from all tables in reverse order to handle foreign keys
    for (const modelName of modelNames.reverse()) {
      const model = (this as Record<string, unknown>)[modelName];
      if (
        model &&
        typeof model === 'object' &&
        'deleteMany' in model &&
        typeof model.deleteMany === 'function'
      ) {
        try {
          await (model.deleteMany as () => Promise<unknown>)();
        } catch {
          // Ignore errors for models that don't exist
        }
      }
    }
  }
}
