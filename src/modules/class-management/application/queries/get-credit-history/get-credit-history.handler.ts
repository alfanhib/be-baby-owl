import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCreditHistoryQuery } from './get-credit-history.query';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

export interface CreditAdjustmentItem {
  id: string;
  adjustment: number;
  creditsBefore: number;
  creditsAfter: number;
  reason: string;
  reasonDetail: string | null;
  adjustedBy: string;
  adjustedByName: string;
  adjustedAt: Date;
}

export interface CreditHistoryResult {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  initialCredits: number;
  currentCredits: number;
  usedCredits: number;
  adjustments: CreditAdjustmentItem[];
}

@QueryHandler(GetCreditHistoryQuery)
export class GetCreditHistoryHandler implements IQueryHandler<GetCreditHistoryQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: GetCreditHistoryQuery,
  ): Promise<CreditHistoryResult | null> {
    const enrollment = await this.prisma.classEnrollment.findUnique({
      where: { id: query.enrollmentId },
      include: {
        student: { select: { fullName: true } },
        class: { select: { id: true, name: true, totalMeetings: true } },
        creditAdjustments: {
          include: {
            adjustedBy: { select: { fullName: true } },
          },
          orderBy: { adjustedAt: 'desc' },
        },
      },
    });

    if (!enrollment) {
      return null;
    }

    const adjustments: CreditAdjustmentItem[] =
      enrollment.creditAdjustments.map((adj) => ({
        id: adj.id,
        adjustment: adj.adjustment,
        creditsBefore: adj.creditsBefore,
        creditsAfter: adj.creditsAfter,
        reason: adj.reason,
        reasonDetail: adj.reasonDetail,
        adjustedBy: adj.adjustedById,
        adjustedByName: adj.adjustedBy.fullName,
        adjustedAt: adj.adjustedAt,
      }));

    return {
      enrollmentId: enrollment.id,
      studentId: enrollment.studentId,
      studentName: enrollment.student.fullName,
      classId: enrollment.class.id,
      className: enrollment.class.name,
      initialCredits: enrollment.class.totalMeetings,
      currentCredits: enrollment.meetingCredits - enrollment.creditsUsed,
      usedCredits: enrollment.creditsUsed,
      adjustments,
    };
  }
}
