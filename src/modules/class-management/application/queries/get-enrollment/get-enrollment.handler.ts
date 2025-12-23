import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetEnrollmentQuery } from './get-enrollment.query';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

export interface TransferRecord {
  fromClassId: string;
  fromClassName: string;
  toClassId: string;
  toClassName: string;
  transferredAt: Date;
  transferredBy: string;
}

export interface CreditAdjustmentRecord {
  id: string;
  type: string;
  amount: number;
  reason: string;
  previousTotal: number;
  newTotal: number;
  adjustedAt: Date;
  adjustedBy: string;
}

export interface EnrollmentDetailResult {
  id: string;
  student: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  course: {
    id: string;
    title: string;
    slug: string;
  };
  class: {
    id: string;
    name: string;
    type: string;
    status: string;
    instructorId: string;
    instructorName: string;
  };
  classPackage: {
    totalMeetings: number;
    lessonsLimit: number;
  };
  credits: {
    total: number;
    used: number;
    remaining: number;
  };
  status: string;
  paymentStatus: string;
  progress: {
    lessonsUnlocked: number;
    lessonsCompleted: number;
    exercisesCompleted: number;
  };
  attendance: {
    present: number;
    absent: number;
    late: number;
    rate: number;
  };
  amount: number | null;
  enrolledAt: Date;
  completedAt: Date | null;
  notes?: string;
  transferHistory: TransferRecord[];
  creditAdjustments: CreditAdjustmentRecord[];
}

@QueryHandler(GetEnrollmentQuery)
export class GetEnrollmentHandler implements IQueryHandler<GetEnrollmentQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: GetEnrollmentQuery,
  ): Promise<EnrollmentDetailResult | null> {
    const enrollment = await this.prisma.classEnrollment.findUnique({
      where: { id: query.enrollmentId },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            totalMeetings: true,
            lessonsUnlocked: true,
            instructorId: true,
            instructor: {
              select: {
                fullName: true,
              },
            },
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
        attendances: {
          select: {
            status: true,
          },
        },
        creditAdjustments: {
          orderBy: { adjustedAt: 'desc' },
          include: {
            adjustedBy: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      return null;
    }

    // Calculate attendance stats
    const attendanceCounts = enrollment.attendances.reduce(
      (acc, att) => {
        acc[att.status]++;
        return acc;
      },
      { present: 0, absent: 0, late: 0 },
    );

    const totalAttendance =
      attendanceCounts.present +
      attendanceCounts.absent +
      attendanceCounts.late;
    const attendanceRate =
      totalAttendance > 0
        ? Math.round(
            ((attendanceCounts.present + attendanceCounts.late) /
              totalAttendance) *
              100 *
              10,
          ) / 10
        : 0;

    // Parse transfer history from credit adjustments with reason 'transfer'
    const transferHistory: TransferRecord[] = enrollment.creditAdjustments
      .filter((adj) => adj.reason === 'transfer')
      .map((adj) => {
        // Parse reasonDetail: "Transferred from X to Y: reason"
        const match = adj.reasonDetail?.match(/Transferred from (.+) to (.+):/);
        return {
          fromClassId: '', // We don't have this info stored
          fromClassName: match?.[1] || 'Unknown',
          toClassId: enrollment.classId,
          toClassName: match?.[2] || enrollment.class.name,
          transferredAt: adj.adjustedAt,
          transferredBy: adj.adjustedBy.fullName,
        };
      });

    // Map credit adjustments
    const creditAdjustments: CreditAdjustmentRecord[] =
      enrollment.creditAdjustments
        .filter((adj) => adj.reason !== 'transfer')
        .map((adj) => ({
          id: adj.id,
          type:
            adj.adjustment > 0
              ? 'add'
              : adj.adjustment < 0
                ? 'deduct'
                : 'reset',
          amount: Math.abs(adj.adjustment),
          reason: adj.reasonDetail || adj.reason,
          previousTotal: adj.creditsBefore,
          newTotal: adj.creditsAfter,
          adjustedAt: adj.adjustedAt,
          adjustedBy: adj.adjustedBy.fullName,
        }));

    return {
      id: enrollment.id,
      student: {
        id: enrollment.student.id,
        name: enrollment.student.fullName,
        email: enrollment.student.email,
        avatar: enrollment.student.avatar || undefined,
      },
      course: {
        id: enrollment.class.course.id,
        title: enrollment.class.course.title,
        slug: enrollment.class.course.slug,
      },
      class: {
        id: enrollment.class.id,
        name: enrollment.class.name,
        type: enrollment.class.type,
        status: enrollment.class.status,
        instructorId: enrollment.class.instructorId,
        instructorName: enrollment.class.instructor.fullName,
      },
      classPackage: {
        totalMeetings: enrollment.class.totalMeetings,
        lessonsLimit: enrollment.class.totalMeetings,
      },
      credits: {
        total: enrollment.meetingCredits,
        used: enrollment.creditsUsed,
        remaining: enrollment.meetingCredits - enrollment.creditsUsed,
      },
      status: enrollment.status,
      paymentStatus: enrollment.paymentStatus,
      progress: {
        lessonsUnlocked: enrollment.class.lessonsUnlocked,
        lessonsCompleted: enrollment.lessonsCompleted,
        exercisesCompleted: enrollment.exercisesCompleted,
      },
      attendance: {
        ...attendanceCounts,
        rate: attendanceRate,
      },
      amount: enrollment.paymentAmount
        ? Number(enrollment.paymentAmount)
        : null,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt,
      transferHistory,
      creditAdjustments,
    };
  }
}
