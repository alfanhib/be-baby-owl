import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetEnrollmentsQuery } from './get-enrollments.query';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface EnrollmentListItem {
  id: string;
  student: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  course: {
    id: string;
    title: string;
  };
  class: {
    id: string;
    name: string;
    type: string;
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
  };
  attendance: {
    present: number;
    absent: number;
    late: number;
    rate: number;
  };
  amount: number | null;
  enrolledAt: Date;
  notes?: string;
}

export interface EnrollmentListResult {
  data: EnrollmentListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@QueryHandler(GetEnrollmentsQuery)
export class GetEnrollmentsHandler implements IQueryHandler<GetEnrollmentsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetEnrollmentsQuery): Promise<EnrollmentListResult> {
    const { filters } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ClassEnrollmentWhereInput = {};

    if (filters.status) {
      where.status = filters.status as Prisma.EnumEnrollmentStatusFilter;
    }

    if (filters.paymentStatus) {
      where.paymentStatus =
        filters.paymentStatus as Prisma.EnumPaymentStatusFilter;
    }

    if (filters.classId) {
      where.classId = filters.classId;
    }

    if (filters.courseId) {
      where.class = { courseId: filters.courseId };
    }

    if (filters.studentId) {
      where.studentId = filters.studentId;
    }

    if (filters.search) {
      where.student = {
        OR: [
          { fullName: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
        ],
      };
    }

    // Get enrollments with relations
    const [enrollments, total] = await Promise.all([
      this.prisma.classEnrollment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { enrolledAt: 'desc' },
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          class: {
            select: {
              id: true,
              name: true,
              type: true,
              totalMeetings: true,
              lessonsUnlocked: true,
              course: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
          attendances: {
            select: {
              status: true,
            },
          },
        },
      }),
      this.prisma.classEnrollment.count({ where }),
    ]);

    // Transform results
    const data: EnrollmentListItem[] = enrollments.map((enrollment) => {
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

      return {
        id: enrollment.id,
        student: {
          id: enrollment.student.id,
          name: enrollment.student.fullName,
          email: enrollment.student.email,
        },
        course: {
          id: enrollment.class.course.id,
          title: enrollment.class.course.title,
        },
        class: {
          id: enrollment.class.id,
          name: enrollment.class.name,
          type: enrollment.class.type,
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
        },
        attendance: {
          ...attendanceCounts,
          rate: attendanceRate,
        },
        amount: enrollment.paymentAmount
          ? Number(enrollment.paymentAmount)
          : null,
        enrolledAt: enrollment.enrolledAt,
      };
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
