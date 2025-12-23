import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserGrowthReportQuery } from './get-user-growth-report.query';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

export interface UserGrowthReportDto {
  summary: {
    totalUsers: number;
    newUsersThisPeriod: number;
    growthRate: number;
    activeUsers: number;
    churnRate: number;
  };
  byRole: {
    role: string;
    total: number;
    new: number;
  }[];
  byPeriod: {
    label: string;
    students: number;
    instructors: number;
    staff: number;
    total: number;
  }[];
  retention: {
    day7: number;
    day30: number;
    day90: number;
  };
  period: {
    start: Date;
    end: Date;
  };
}

@QueryHandler(GetUserGrowthReportQuery)
export class GetUserGrowthReportHandler implements IQueryHandler<GetUserGrowthReportQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetUserGrowthReportQuery): Promise<UserGrowthReportDto> {
    const now = new Date();
    let startDate = query.startDate;
    const endDate = query.endDate || now;

    if (!startDate) {
      switch (query.period) {
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        case 'quarter': {
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          break;
        }
        case 'month':
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }
    }

    // Get total users
    const totalUsers = await this.prisma.user.count();

    // Get new users in period
    const newUsersThisPeriod = await this.prisma.user.count({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
    });

    // Get users before period for growth rate calculation
    const usersBeforePeriod = await this.prisma.user.count({
      where: {
        createdAt: { lt: startDate },
      },
    });

    const growthRate =
      usersBeforePeriod > 0
        ? Math.round((newUsersThisPeriod / usersBeforePeriod) * 100)
        : 100;

    // Get active users (updated in last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const activeUsers = await this.prisma.user.count({
      where: {
        updatedAt: { gte: sevenDaysAgo },
      },
    });

    // Churn rate (inactive users / total)
    const churnRate = Math.round(
      ((totalUsers - activeUsers) / totalUsers) * 100,
    );

    // By role breakdown
    const roleCountsTotal = await this.prisma.user.groupBy({
      by: ['role'],
      _count: { id: true },
    });

    const roleCountsNew = await this.prisma.user.groupBy({
      by: ['role'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      _count: { id: true },
    });

    const byRole = ['student', 'instructor', 'staff', 'super_admin'].map(
      (role) => ({
        role,
        total: roleCountsTotal.find((r) => r.role === role)?._count.id || 0,
        new: roleCountsNew.find((r) => r.role === role)?._count.id || 0,
      }),
    );

    // Monthly breakdown
    const byPeriod = await this.getMonthlyBreakdown(startDate, endDate);

    // Retention rates (simplified)
    const retention = await this.calculateRetention();

    return {
      summary: {
        totalUsers,
        newUsersThisPeriod,
        growthRate,
        activeUsers,
        churnRate,
      },
      byRole,
      byPeriod,
      retention,
      period: {
        start: startDate,
        end: endDate,
      },
    };
  }

  private async getMonthlyBreakdown(
    startDate: Date,
    endDate: Date,
  ): Promise<
    {
      label: string;
      students: number;
      instructors: number;
      staff: number;
      total: number;
    }[]
  > {
    const result: {
      label: string;
      students: number;
      instructors: number;
      staff: number;
      total: number;
    }[] = [];
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

    while (current <= endDate) {
      const monthEnd = new Date(
        current.getFullYear(),
        current.getMonth() + 1,
        0,
      );

      const counts = await this.prisma.user.groupBy({
        by: ['role'],
        where: {
          createdAt: { lte: monthEnd },
        },
        _count: { id: true },
      });

      const students = counts.find((c) => c.role === 'student')?._count.id || 0;
      const instructors =
        counts.find((c) => c.role === 'instructor')?._count.id || 0;
      const staff = counts.find((c) => c.role === 'staff')?._count.id || 0;

      result.push({
        label: current.toLocaleString('default', {
          month: 'short',
          year: 'numeric',
        }),
        students,
        instructors,
        staff,
        total: students + instructors + staff,
      });

      current.setMonth(current.getMonth() + 1);
    }

    return result;
  }

  private async calculateRetention(): Promise<{
    day7: number;
    day30: number;
    day90: number;
  }> {
    // Simplified retention: users who were active after X days from creation
    const day7 = await this.calculateRetentionRate(7);
    const day30 = await this.calculateRetentionRate(30);
    const day90 = await this.calculateRetentionRate(90);

    return { day7, day30, day90 };
  }

  private async calculateRetentionRate(days: number): Promise<number> {
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Users created before cutoff
    const usersCreatedBefore = await this.prisma.user.count({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });

    if (usersCreatedBefore === 0) return 100;

    // Of those, how many were active after their creation + days
    const activeAfterDays = await this.prisma.user.count({
      where: {
        createdAt: { lt: cutoffDate },
        updatedAt: { gte: cutoffDate },
      },
    });

    return Math.round((activeAfterDays / usersCreatedBefore) * 100);
  }
}
