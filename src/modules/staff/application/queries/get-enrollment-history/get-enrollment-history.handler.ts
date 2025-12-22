import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetEnrollmentHistoryQuery } from './get-enrollment-history.query';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { Prisma } from '@prisma/client';

interface EnrollmentHistoryItem {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  classId: string;
  className: string;
  courseName: string;
  status: string;
  enrolledAt: string;
  completedAt: string | null;
  credits: {
    total: number;
    used: number;
    remaining: number;
  };
}

interface EnrollmentHistoryResult {
  data: EnrollmentHistoryItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@QueryHandler(GetEnrollmentHistoryQuery)
export class GetEnrollmentHistoryHandler
  implements IQueryHandler<GetEnrollmentHistoryQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: GetEnrollmentHistoryQuery,
  ): Promise<EnrollmentHistoryResult> {
    const where: Prisma.ClassEnrollmentWhereInput = {};

    if (query.classId) {
      where.classId = query.classId;
    }

    if (query.studentId) {
      where.studentId = query.studentId;
    }

    if (query.startDate || query.endDate) {
      where.enrolledAt = {};
      if (query.startDate) {
        where.enrolledAt.gte = query.startDate;
      }
      if (query.endDate) {
        where.enrolledAt.lte = query.endDate;
      }
    }

    const [enrollments, total] = await Promise.all([
      this.prisma.classEnrollment.findMany({
        where,
        include: {
          student: {
            select: { id: true, fullName: true, email: true },
          },
          class: {
            select: {
              id: true,
              name: true,
              course: { select: { title: true } },
            },
          },
        },
        orderBy: { enrolledAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.classEnrollment.count({ where }),
    ]);

    const data: EnrollmentHistoryItem[] = enrollments.map((e) => ({
      id: e.id,
      studentId: e.studentId,
      studentName: e.student.fullName,
      studentEmail: e.student.email,
      classId: e.classId,
      className: e.class.name,
      courseName: e.class.course.title,
      status: e.status,
      enrolledAt: e.enrolledAt.toISOString(),
      completedAt: e.completedAt?.toISOString() ?? null,
      credits: {
        total: e.meetingCredits,
        used: e.creditsUsed,
        remaining: e.meetingCredits - e.creditsUsed,
      },
    }));

    return {
      data,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }
}

