import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetSystemHealthQuery } from './get-system-health.query';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

interface ServiceHealth {
  status: 'healthy' | 'warning' | 'critical';
  responseTime?: number;
  connections?: number;
  maxConnections?: number;
  hitRate?: number;
  used?: number;
  total?: number;
  queue?: number;
}

export interface SystemHealthDto {
  overall: 'healthy' | 'warning' | 'critical';
  services: {
    api: ServiceHealth;
    database: ServiceHealth;
    cache: ServiceHealth;
    storage: ServiceHealth;
    email: ServiceHealth;
  };
  lastCheck: Date;
}

@QueryHandler(GetSystemHealthQuery)
export class GetSystemHealthHandler implements IQueryHandler<GetSystemHealthQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<SystemHealthDto> {
    // Check database health
    const dbHealth = await this.checkDatabaseHealth();

    // Mock other service health checks
    const apiHealth: ServiceHealth = {
      status: 'healthy',
      responseTime: Math.floor(Math.random() * 50) + 30,
    };

    const cacheHealth: ServiceHealth = {
      status: 'healthy',
      hitRate: 95,
    };

    const storageHealth: ServiceHealth = {
      status: 'healthy',
      used: 50,
      total: 100,
    };

    const emailHealth: ServiceHealth = {
      status: 'healthy',
      queue: Math.floor(Math.random() * 10),
    };

    // Determine overall health
    const services = {
      api: apiHealth,
      database: dbHealth,
      cache: cacheHealth,
      storage: storageHealth,
      email: emailHealth,
    };

    const overall = this.determineOverallHealth(services);

    return {
      overall,
      services,
      lastCheck: new Date(),
    };
  }

  private async checkDatabaseHealth(): Promise<ServiceHealth> {
    try {
      const startTime = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;

      return {
        status: responseTime < 100 ? 'healthy' : 'warning',
        responseTime,
        connections: 10, // Would need actual pool metrics
        maxConnections: 100,
      };
    } catch {
      return {
        status: 'critical',
        responseTime: 0,
        connections: 0,
        maxConnections: 100,
      };
    }
  }

  private determineOverallHealth(services: {
    api: ServiceHealth;
    database: ServiceHealth;
    cache: ServiceHealth;
    storage: ServiceHealth;
    email: ServiceHealth;
  }): 'healthy' | 'warning' | 'critical' {
    const statuses = Object.values(services).map((s) => s.status);

    if (statuses.includes('critical')) {
      return 'critical';
    }
    if (statuses.includes('warning')) {
      return 'warning';
    }
    return 'healthy';
  }
}
