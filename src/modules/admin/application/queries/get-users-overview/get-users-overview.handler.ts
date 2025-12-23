import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUsersOverviewQuery } from './get-users-overview.query';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

interface RecentSignup {
  id: string;
  name: string;
  role: string;
  createdAt: Date;
}

interface TopActiveUser {
  id: string;
  name: string;
  activityScore: number;
}

export interface UsersOverviewDto {
  total: number;
  byRole: {
    student: number;
    instructor: number;
    staff: number;
    super_admin: number;
  };
  byStatus: {
    active: number;
    inactive: number;
    suspended: number;
  };
  recentSignups: RecentSignup[];
  topActiveUsers: TopActiveUser[];
}

@QueryHandler(GetUsersOverviewQuery)
export class GetUsersOverviewHandler implements IQueryHandler<GetUsersOverviewQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<UsersOverviewDto> {
    // Get counts by role
    const roleCounts = await this.prisma.user.groupBy({
      by: ['role'],
      _count: { id: true },
    });

    // Get counts by status
    const statusCounts = await this.prisma.user.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // Get recent signups (last 10)
    const recentUsers = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });

    // Get top active users (by recent activity)
    const activeUsers = await this.prisma.user.findMany({
      where: { role: 'student' },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        fullName: true,
        updatedAt: true,
      },
    });

    const total = roleCounts.reduce((sum, r) => sum + r._count.id, 0);

    return {
      total,
      byRole: {
        student: roleCounts.find((r) => r.role === 'student')?._count.id || 0,
        instructor:
          roleCounts.find((r) => r.role === 'instructor')?._count.id || 0,
        staff: roleCounts.find((r) => r.role === 'staff')?._count.id || 0,
        super_admin:
          roleCounts.find((r) => r.role === 'super_admin')?._count.id || 0,
      },
      byStatus: {
        active: statusCounts.find((s) => s.status === 'active')?._count.id || 0,
        inactive:
          statusCounts.find((s) => s.status === 'inactive')?._count.id || 0,
        suspended:
          statusCounts.find((s) => s.status === 'suspended')?._count.id || 0,
      },
      recentSignups: recentUsers.map((u) => ({
        id: u.id,
        name: u.fullName,
        role: u.role,
        createdAt: u.createdAt,
      })),
      topActiveUsers: activeUsers.map((u, idx) => ({
        id: u.id,
        name: u.fullName,
        activityScore: 100 - idx * 5, // Simplified scoring
      })),
    };
  }
}
