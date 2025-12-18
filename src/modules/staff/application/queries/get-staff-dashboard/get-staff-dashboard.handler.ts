import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetStaffDashboardQuery } from './get-staff-dashboard.query';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { EnrollmentStatus, PaymentStatus, ClassStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

interface StaffDashboardStats {
  pendingEnrollments: number;
  activeClasses: number;
  pendingPayments: number;
  totalStudents: number;
  totalInstructors: number;
  monthlyRevenue: number;
  todayEnrollments: number;
  weeklyEnrollments: number;
  completedClasses: number;
  verifiedPaymentsToday: number;
  pendingPaymentsAmount: number;
}

interface QuickStats {
  label: string;
  value: number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: string;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: Date;
}

interface PendingAction {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
  actionUrl: string;
}

interface StaffDashboardResult {
  stats: StaffDashboardStats;
  quickStats: QuickStats[];
  recentActivity: RecentActivity[];
  pendingActions: PendingAction[];
}

function toNumber(value: Decimal | number | null): number {
  if (value === null) return 0;
  if (typeof value === 'number') return value;
  return value.toNumber();
}

@QueryHandler(GetStaffDashboardQuery)
export class GetStaffDashboardHandler implements IQueryHandler<GetStaffDashboardQuery> {
  constructor(private readonly prisma: PrismaService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(_query: GetStaffDashboardQuery): Promise<StaffDashboardResult> {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Parallel queries for dashboard stats
    const [
      pendingEnrollments,
      activeClasses,
      pendingPayments,
      totalStudents,
      totalInstructors,
      monthlyRevenueResult,
      todayEnrollments,
      weeklyEnrollments,
      completedClasses,
      verifiedPaymentsToday,
      pendingPaymentsAmountResult,
      recentEnrollments,
      recentPayments,
    ] = await Promise.all([
      // Pending enrollments count
      this.prisma.classEnrollment.count({
        where: { status: EnrollmentStatus.active },
      }),
      // Active classes count
      this.prisma.class.count({
        where: { status: ClassStatus.active },
      }),
      // Pending payments count
      this.prisma.payment.count({
        where: { status: PaymentStatus.pending },
      }),
      // Total students
      this.prisma.user.count({
        where: { role: 'student', status: 'active' },
      }),
      // Total instructors
      this.prisma.user.count({
        where: { role: 'instructor', status: 'active' },
      }),
      // Monthly revenue (verified payments)
      this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.verified,
          verifiedAt: { gte: monthStart },
        },
        _sum: { amount: true },
      }),
      // Today's enrollments
      this.prisma.classEnrollment.count({
        where: { enrolledAt: { gte: todayStart } },
      }),
      // Weekly enrollments
      this.prisma.classEnrollment.count({
        where: { enrolledAt: { gte: weekStart } },
      }),
      // Completed classes
      this.prisma.class.count({
        where: { status: ClassStatus.completed },
      }),
      // Verified payments today
      this.prisma.payment.count({
        where: {
          status: PaymentStatus.verified,
          verifiedAt: { gte: todayStart },
        },
      }),
      // Pending payments amount
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.pending },
        _sum: { amount: true },
      }),
      // Recent enrollments for activity feed
      this.prisma.classEnrollment.findMany({
        take: 5,
        orderBy: { enrolledAt: 'desc' },
        include: {
          student: { select: { id: true, fullName: true, email: true } },
          class: { select: { id: true, name: true } },
        },
      }),
      // Recent verified payments for activity feed
      this.prisma.payment.findMany({
        take: 5,
        where: { status: PaymentStatus.verified },
        orderBy: { verifiedAt: 'desc' },
      }),
    ]);

    // Build stats
    const stats: StaffDashboardStats = {
      pendingEnrollments,
      activeClasses,
      pendingPayments,
      totalStudents,
      totalInstructors,
      monthlyRevenue: toNumber(monthlyRevenueResult._sum.amount),
      todayEnrollments,
      weeklyEnrollments,
      completedClasses,
      verifiedPaymentsToday,
      pendingPaymentsAmount: toNumber(pendingPaymentsAmountResult._sum.amount),
    };

    // Build quick stats
    const quickStats: QuickStats[] = [
      {
        label: "Today's Enrollments",
        value: todayEnrollments,
        icon: 'user-plus',
      },
      {
        label: 'Pending Payments',
        value: pendingPayments,
        icon: 'credit-card',
      },
      {
        label: 'Active Classes',
        value: activeClasses,
        icon: 'book-open',
      },
      {
        label: 'Total Students',
        value: totalStudents,
        icon: 'users',
      },
    ];

    // Build recent activity
    const recentActivity: RecentActivity[] = [];

    for (const enrollment of recentEnrollments) {
      recentActivity.push({
        id: enrollment.id,
        type: 'enrollment',
        title: 'New Enrollment',
        description: `${enrollment.student.fullName} enrolled in ${enrollment.class.name}`,
        timestamp: enrollment.enrolledAt,
      });
    }

    for (const payment of recentPayments) {
      const amount = toNumber(payment.amount);
      recentActivity.push({
        id: payment.id,
        type: 'payment_verified',
        title: 'Payment Verified',
        description: `Payment of Rp ${amount.toLocaleString('id-ID')} from ${payment.studentName}`,
        timestamp: payment.verifiedAt || payment.createdAt,
      });
    }

    // Sort by timestamp desc
    recentActivity.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );

    // Build pending actions
    const pendingPaymentsList = await this.prisma.payment.findMany({
      where: { status: PaymentStatus.pending },
      orderBy: { createdAt: 'asc' },
      take: 5,
    });

    const pendingActions: PendingAction[] = pendingPaymentsList.map(
      (payment) => {
        const daysWaiting = Math.floor(
          (Date.now() - payment.createdAt.getTime()) / (1000 * 60 * 60 * 24),
        );
        const amount = toNumber(payment.amount);
        return {
          id: payment.id,
          type: 'verify_payment',
          title: 'Verify Payment',
          description: `Rp ${amount.toLocaleString('id-ID')} from ${payment.studentName} - waiting ${daysWaiting} days`,
          priority:
            daysWaiting > 3 ? 'high' : daysWaiting > 1 ? 'medium' : 'low',
          createdAt: payment.createdAt,
          actionUrl: `/staff/payments/${payment.id}`,
        };
      },
    );

    return {
      stats,
      quickStats,
      recentActivity: recentActivity.slice(0, 10),
      pendingActions,
    };
  }
}
