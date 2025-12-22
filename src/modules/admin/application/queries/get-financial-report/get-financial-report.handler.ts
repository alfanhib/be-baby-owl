import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetFinancialReportQuery } from './get-financial-report.query';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';

export interface FinancialReportDto {
  summary: {
    totalRevenue: number;
    pendingRevenue: number;
    refundedAmount: number;
    netRevenue: number;
  };
  byPeriod: {
    label: string;
    revenue: number;
    transactions: number;
  }[];
  byPaymentMethod: {
    method: string;
    amount: number;
    count: number;
  }[];
  byCourse: {
    courseId: string;
    courseName: string;
    revenue: number;
    enrollments: number;
  }[];
  period: {
    start: Date;
    end: Date;
  };
}

@QueryHandler(GetFinancialReportQuery)
export class GetFinancialReportHandler
  implements IQueryHandler<GetFinancialReportQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetFinancialReportQuery): Promise<FinancialReportDto> {
    const now = new Date();
    let startDate = query.startDate;
    let endDate = query.endDate || now;

    // Calculate date range based on period
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

    // Get summary data
    const [verifiedSum, pendingSum, refundedSum] = await Promise.all([
      this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.verified,
          createdAt: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.pending,
          createdAt: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.refunded,
          createdAt: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
    ]);

    const totalRevenue = Number(verifiedSum._sum.amount || 0);
    const pendingRevenue = Number(pendingSum._sum.amount || 0);
    const refundedAmount = Number(refundedSum._sum.amount || 0);

    // Get revenue by payment method
    const byMethodRaw = await this.prisma.payment.groupBy({
      by: ['paymentMethod'],
      where: {
        status: PaymentStatus.verified,
        createdAt: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
      _count: { id: true },
    });

    const byPaymentMethod = byMethodRaw.map((m) => ({
      method: m.paymentMethod || 'unknown',
      amount: Number(m._sum.amount || 0),
      count: m._count.id,
    }));

    // Get revenue by course
    const coursePayments = await this.prisma.payment.findMany({
      where: {
        status: PaymentStatus.verified,
        createdAt: { gte: startDate, lte: endDate },
        courseId: { not: null },
      },
      include: {
        course: { select: { id: true, title: true } },
      },
    });

    const courseMap = new Map<
      string,
      { courseName: string; revenue: number; enrollments: number }
    >();
    for (const payment of coursePayments) {
      if (!payment.course) continue;
      const existing = courseMap.get(payment.course.id) || {
        courseName: payment.course.title,
        revenue: 0,
        enrollments: 0,
      };
      existing.revenue += Number(payment.amount);
      existing.enrollments += 1;
      courseMap.set(payment.course.id, existing);
    }

    const byCourse = Array.from(courseMap.entries()).map(([courseId, data]) => ({
      courseId,
      ...data,
    }));

    // Get revenue by period (monthly breakdown)
    const byPeriod = await this.getMonthlyBreakdown(startDate, endDate);

    return {
      summary: {
        totalRevenue,
        pendingRevenue,
        refundedAmount,
        netRevenue: totalRevenue - refundedAmount,
      },
      byPeriod,
      byPaymentMethod,
      byCourse,
      period: {
        start: startDate,
        end: endDate,
      },
    };
  }

  private async getMonthlyBreakdown(
    startDate: Date,
    endDate: Date,
  ): Promise<{ label: string; revenue: number; transactions: number }[]> {
    const result: { label: string; revenue: number; transactions: number }[] = [];
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

    while (current <= endDate) {
      const monthStart = new Date(current);
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);

      const data = await this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.verified,
          createdAt: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
        _count: { id: true },
      });

      result.push({
        label: current.toLocaleString('default', {
          month: 'short',
          year: 'numeric',
        }),
        revenue: Number(data._sum.amount || 0),
        transactions: data._count.id,
      });

      current.setMonth(current.getMonth() + 1);
    }

    return result;
  }
}

