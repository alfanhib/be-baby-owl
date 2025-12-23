import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetDashboardQuery } from './get-dashboard.query';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { PaymentStatus, ClassStatus, UserStatus } from '@prisma/client';

export interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  totalStaff: number;
  totalCourses: number;
  totalClasses: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeClasses: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  completedClasses: number;
  pendingPayments: number;
  pendingPaymentsAmount: number;
  atRiskStudents: number;
  averageCourseCompletion: number;
  newStudentsThisMonth: number;
  newStudentsLastMonth: number;
}

export interface SystemMetrics {
  apiResponseTime: number;
  databaseSize: number;
  activeUsers: number;
  errorRate: number;
  uptime: number;
  requestsPerMinute: number;
  peakUsageTime: string;
}

export interface UserGrowthData {
  labels: string[];
  students: number[];
  instructors: number[];
  staff: number[];
}

export interface RevenueData {
  labels: string[];
  revenue: number[];
  enrollments: number[];
}

export interface DashboardAlert {
  type: 'warning' | 'info' | 'error';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface DashboardDto {
  stats: DashboardStats;
  systemMetrics: SystemMetrics;
  userGrowth: UserGrowthData;
  revenueData: RevenueData;
  alerts: DashboardAlert[];
}

@QueryHandler(GetDashboardQuery)
export class GetDashboardHandler implements IQueryHandler<GetDashboardQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<DashboardDto> {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get user counts by role
    const userCounts = await this.prisma.user.groupBy({
      by: ['role'],
      _count: { id: true },
    });

    const totalUsers = userCounts.reduce((sum, u) => sum + u._count.id, 0);
    const totalStudents =
      userCounts.find((u) => u.role === 'student')?._count.id || 0;
    const totalInstructors =
      userCounts.find((u) => u.role === 'instructor')?._count.id || 0;
    const totalStaff =
      userCounts.find((u) => u.role === 'staff')?._count.id || 0;

    // Get course and class counts
    const [totalCourses, totalClasses, activeClasses, completedClasses] =
      await Promise.all([
        this.prisma.course.count(),
        this.prisma.class.count(),
        this.prisma.class.count({ where: { status: ClassStatus.active } }),
        this.prisma.class.count({ where: { status: ClassStatus.completed } }),
      ]);

    // Get revenue data
    const [totalRevenueResult, monthlyRevenueResult] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.verified },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.verified,
          createdAt: { gte: thisMonthStart },
        },
        _sum: { amount: true },
      }),
    ]);

    const totalRevenue = Number(totalRevenueResult._sum.amount || 0);
    const monthlyRevenue = Number(monthlyRevenueResult._sum.amount || 0);

    // Get pending payments
    const pendingPaymentsData = await this.prisma.payment.aggregate({
      where: { status: PaymentStatus.pending },
      _count: { id: true },
      _sum: { amount: true },
    });

    const pendingPayments = pendingPaymentsData._count.id || 0;
    const pendingPaymentsAmount = Number(pendingPaymentsData._sum.amount || 0);

    // Get new students this month and last month
    const [newStudentsThisMonth, newStudentsLastMonth] = await Promise.all([
      this.prisma.user.count({
        where: {
          role: 'student',
          createdAt: { gte: thisMonthStart },
        },
      }),
      this.prisma.user.count({
        where: {
          role: 'student',
          createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
        },
      }),
    ]);

    // Calculate at-risk students (inactive for 7+ days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const atRiskStudents = await this.prisma.user.count({
      where: {
        role: 'student',
        status: UserStatus.active,
        updatedAt: { lt: sevenDaysAgo },
      },
    });

    // Calculate average course completion (simplified)
    const averageCourseCompletion = 75; // Placeholder - would need progress tracking

    // Get user growth data (last 3 months)
    const userGrowth = await this.getUserGrowthData();

    // Get revenue data (last 3 months)
    const revenueData = await this.getRevenueData();

    // System metrics (simplified)
    const systemMetrics: SystemMetrics = {
      apiResponseTime: Math.floor(Math.random() * 50) + 50, // 50-100ms
      databaseSize: 1024 * 1024 * 500, // 500MB placeholder
      activeUsers: await this.getActiveUsersCount(),
      errorRate: 0.02,
      uptime: 99.95,
      requestsPerMinute: Math.floor(Math.random() * 100) + 200,
      peakUsageTime: '19:00-21:00',
    };

    // Generate alerts
    const alerts = this.generateAlerts({
      pendingPayments,
      atRiskStudents,
      systemMetrics,
    });

    // Determine system health
    const systemHealth = this.determineSystemHealth(systemMetrics, alerts);

    return {
      stats: {
        totalUsers,
        totalStudents,
        totalInstructors,
        totalStaff,
        totalCourses,
        totalClasses,
        totalRevenue,
        monthlyRevenue,
        activeClasses,
        systemHealth,
        completedClasses,
        pendingPayments,
        pendingPaymentsAmount,
        atRiskStudents,
        averageCourseCompletion,
        newStudentsThisMonth,
        newStudentsLastMonth,
      },
      systemMetrics,
      userGrowth,
      revenueData,
      alerts,
    };
  }

  private async getUserGrowthData(): Promise<UserGrowthData> {
    const now = new Date();
    const labels: string[] = [];
    const students: number[] = [];
    const instructors: number[] = [];
    const staff: number[] = [];

    for (let i = 2; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthName = monthDate.toLocaleString('default', { month: 'short' });
      labels.push(monthName);

      const counts = await this.prisma.user.groupBy({
        by: ['role'],
        where: {
          createdAt: { lte: monthEnd },
        },
        _count: { id: true },
      });

      students.push(counts.find((c) => c.role === 'student')?._count.id || 0);
      instructors.push(
        counts.find((c) => c.role === 'instructor')?._count.id || 0,
      );
      staff.push(counts.find((c) => c.role === 'staff')?._count.id || 0);
    }

    return { labels, students, instructors, staff };
  }

  private async getRevenueData(): Promise<RevenueData> {
    const now = new Date();
    const labels: string[] = [];
    const revenue: number[] = [];
    const enrollments: number[] = [];

    for (let i = 2; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthName = monthStart.toLocaleString('default', {
        month: 'short',
      });
      labels.push(monthName);

      const [revenueResult, enrollmentCount] = await Promise.all([
        this.prisma.payment.aggregate({
          where: {
            status: PaymentStatus.verified,
            createdAt: { gte: monthStart, lte: monthEnd },
          },
          _sum: { amount: true },
        }),
        this.prisma.classEnrollment.count({
          where: {
            enrolledAt: { gte: monthStart, lte: monthEnd },
          },
        }),
      ]);

      revenue.push(Number(revenueResult._sum.amount || 0));
      enrollments.push(enrollmentCount);
    }

    return { labels, revenue, enrollments };
  }

  private async getActiveUsersCount(): Promise<number> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.prisma.user.count({
      where: {
        updatedAt: { gte: oneDayAgo },
      },
    });
  }

  private generateAlerts(data: {
    pendingPayments: number;
    atRiskStudents: number;
    systemMetrics: SystemMetrics;
  }): DashboardAlert[] {
    const alerts: DashboardAlert[] = [];

    if (data.pendingPayments > 5) {
      alerts.push({
        type: 'warning',
        message: `${data.pendingPayments} payments awaiting verification`,
        severity: data.pendingPayments > 10 ? 'high' : 'medium',
      });
    }

    if (data.atRiskStudents > 10) {
      alerts.push({
        type: 'info',
        message: `${data.atRiskStudents} at-risk students need attention`,
        severity: 'low',
      });
    }

    if (data.systemMetrics.errorRate > 0.05) {
      alerts.push({
        type: 'error',
        message: 'High error rate detected',
        severity: 'high',
      });
    }

    return alerts;
  }

  private determineSystemHealth(
    metrics: SystemMetrics,
    alerts: DashboardAlert[],
  ): 'healthy' | 'warning' | 'critical' {
    const hasHighAlert = alerts.some((a) => a.severity === 'high');
    const hasMediumAlert = alerts.some((a) => a.severity === 'medium');

    if (hasHighAlert || metrics.errorRate > 0.1 || metrics.uptime < 99) {
      return 'critical';
    }
    if (hasMediumAlert || metrics.errorRate > 0.05) {
      return 'warning';
    }
    return 'healthy';
  }
}
