import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetEnrollmentStatsQuery } from './get-enrollment-stats.query';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

export interface EnrollmentStatsResult {
  total: number;
  byStatus: {
    active: number;
    completed: number;
    withdrawn: number;
  };
  byPaymentStatus: {
    pending: number;
    verified: number;
    refunded: number;
  };
  thisMonth: number;
  lastMonth: number;
  growthRate: number;
}

@QueryHandler(GetEnrollmentStatsQuery)
export class GetEnrollmentStatsHandler implements IQueryHandler<GetEnrollmentStatsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _query: GetEnrollmentStatsQuery,
  ): Promise<EnrollmentStatsResult> {
    // Get current date info
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get all counts in parallel
    const [
      total,
      activeCount,
      completedCount,
      withdrawnCount,
      pendingPayment,
      verifiedPayment,
      refundedPayment,
      thisMonthCount,
      lastMonthCount,
    ] = await Promise.all([
      // Total enrollments
      this.prisma.classEnrollment.count(),
      // By status
      this.prisma.classEnrollment.count({ where: { status: 'active' } }),
      this.prisma.classEnrollment.count({ where: { status: 'completed' } }),
      this.prisma.classEnrollment.count({ where: { status: 'withdrawn' } }),
      // By payment status
      this.prisma.classEnrollment.count({
        where: { paymentStatus: 'pending' },
      }),
      this.prisma.classEnrollment.count({
        where: { paymentStatus: 'verified' },
      }),
      this.prisma.classEnrollment.count({
        where: { paymentStatus: 'refunded' },
      }),
      // This month
      this.prisma.classEnrollment.count({
        where: {
          enrolledAt: {
            gte: startOfThisMonth,
          },
        },
      }),
      // Last month
      this.prisma.classEnrollment.count({
        where: {
          enrolledAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),
    ]);

    // Calculate growth rate
    const growthRate =
      lastMonthCount > 0
        ? Math.round(
            ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100 * 10,
          ) / 10
        : thisMonthCount > 0
          ? 100
          : 0;

    return {
      total,
      byStatus: {
        active: activeCount,
        completed: completedCount,
        withdrawn: withdrawnCount,
      },
      byPaymentStatus: {
        pending: pendingPayment,
        verified: verifiedPayment,
        refunded: refundedPayment,
      },
      thisMonth: thisMonthCount,
      lastMonth: lastMonthCount,
      growthRate,
    };
  }
}
