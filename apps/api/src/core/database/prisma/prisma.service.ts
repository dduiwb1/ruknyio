import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { DB_PERFORMANCE } from '../database.constants';

/**
 * ⚡ Extended Prisma Client with performance optimizations
 * 
 * Features:
 * - Connection pooling for Neon PostgreSQL
 * - Automatic reconnection on connection errors
 * - Query performance monitoring
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private queryCount = 0;
  private slowQueryCount = 0;
  private isConnected = false;

  constructor() {
    // ⚠️ Validate DATABASE_URL exists before initializing
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error(
        '❌ DATABASE_URL environment variable is not defined. ' +
        'Please ensure it is set in your Railway environment variables. ' +
        'Expected format: postgresql://user:password@host:port/database?sslmode=require'
      );
    }

    super({
      log: [
        // ⚡ Performance: Log slow queries in development
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'warn' },
      ],
      // ⚡ Neon PostgreSQL connection settings
      // These help with serverless connection pooling
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });

    // ⚡ Query performance monitoring
    // @ts-ignore - Prisma event typing
    this.$on('query', (e: Prisma.QueryEvent) => {
      this.queryCount++;

      if (e.duration > DB_PERFORMANCE.VERY_SLOW_QUERY_THRESHOLD) {
        this.slowQueryCount++;
        this.logger.error(
          `🔴 Very Slow Query (${e.duration}ms): ${e.query.substring(0, 200)}...`,
        );
      } else if (
        e.duration > DB_PERFORMANCE.SLOW_QUERY_THRESHOLD &&
        process.env.NODE_ENV !== 'production'
      ) {
        this.logger.warn(`⚠️ Slow Query (${e.duration}ms): ${e.query.substring(0, 200)}...`);
      }
    });
  }

  async onModuleInit() {
    const startTime = Date.now();
    await this.connectWithRetry();
    const duration = Date.now() - startTime;
    this.logger.log(`✅ Database connected successfully (${duration}ms)`);
  }

  /**
   * ⚡ Connect with retry logic for Neon PostgreSQL
   * Handles connection pool timeouts and serverless cold starts
   */
  private async connectWithRetry(maxRetries = 3, delayMs = 1000): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.$connect();
        this.isConnected = true;
        return;
      } catch (error) {
        this.logger.warn(
          `Database connection attempt ${attempt}/${maxRetries} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  /**
   * ⚡ Ensure connection is alive, reconnect if needed
   * Call this before critical operations after long idle periods
   */
  async ensureConnection(): Promise<void> {
    try {
      await this.$queryRaw`SELECT 1`;
    } catch (error) {
      this.logger.warn('Connection lost, attempting to reconnect...');
      this.isConnected = false;
      await this.connectWithRetry();
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('🔌 Database disconnected');
  }

  /**
   * ⚡ Get database health status
   */
  async getHealthStatus(): Promise<{
    connected: boolean;
    responseTime: number;
    queryCount: number;
    slowQueryCount: number;
    poolInfo?: any;
  }> {
    const startTime = Date.now();
    let connected = false;

    try {
      // Simple query to test connection
      await this.$queryRaw`SELECT 1`;
      connected = true;
    } catch (error) {
      this.logger.error('Database health check failed:', error);
    }

    const responseTime = Date.now() - startTime;

    return {
      connected,
      responseTime,
      queryCount: this.queryCount,
      slowQueryCount: this.slowQueryCount,
    };
  }

  /**
   * ⚡ Reset query counters (useful for monitoring)
   */
  resetQueryCounters(): void {
    this.queryCount = 0;
    this.slowQueryCount = 0;
  }

  /**
   * ⚡ Execute raw query with timeout
   */
  async executeWithTimeout<T>(
    query: () => Promise<T>,
    timeoutMs: number = DB_PERFORMANCE.SLOW_QUERY_THRESHOLD * 2,
  ): Promise<T> {
    return Promise.race([
      query(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Query timeout after ${timeoutMs}ms`)), timeoutMs),
      ),
    ]);
  }

  /**
   * ⚡ Soft delete helper - marks record as deleted without removing
   */
  async softDelete<T extends { deletedAt?: Date | null }>(
    model: any,
    where: any,
  ): Promise<T> {
    return model.update({
      where,
      data: { deletedAt: new Date() },
    });
  }

  /**
   * ⚡ Batch operations helper - processes in chunks to avoid timeouts
   */
  async batchProcess<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number = 100,
  ): Promise<R[]> {
    const results: R[] = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(processor));
      results.push(...batchResults);

      // Small delay between batches to prevent overwhelming the DB
      if (i + batchSize < items.length) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }

    return results;
  }
}
