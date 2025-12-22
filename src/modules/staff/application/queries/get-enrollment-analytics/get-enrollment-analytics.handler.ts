import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetEnrollmentAnalyticsQuery } from './get-enrollment-analytics.query';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { Prisma } from '@prisma/client';

interface DailyEnrollment {
  date: string;
  count: number;
}

interface CourseEnrollment {
  courseId: string;
  courseName: string;
  count: number;
}

interface EnrollmentAnalyticsResult {
  summary: {
    totalEnrollments: number;
    activeEnrollments: number;
    completedEnrollments: number;
    withdrawnEnrollments: number;
  };
  trends: {
    daily: DailyEnrollment[];
  };
  byCourse: CourseEnrollment[];
  byStatus: {
    active: number;
    completed: number;
    withdrawn: number;
  };
}

@QueryHandler(GetEnrollmentAnalyticsQuery)
export class GetEnrollmentAnalyticsHandler
  implements IQueryHandler<GetEnrollmentAnalyticsQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: GetEnrollmentAnalyticsQuery,
  ): Promise<EnrollmentAnalyticsResult> {
    const where: Prisma.ClassEnrollmentWhereInput = {};

    if (query.startDate || query.endDate) {
      where.enrolledAt = {};
      if (query.startDate) {
        where.enrolledAt.gte = query.startDate;
      }
      if (query.endDate) {
        where.enrolledAt.lte = query.endDate;
      }
    }

    if (query.courseId) {
      where.class = { courseId: query.courseId };
    }

    // Get summary stats
    const [total, byStatus] = await Promise.all([
      this.prisma.classEnrollment.count({ where }),
      this.prisma.classEnrollment.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
      }),
    ]);

    const statusCounts = {
      active: 0,
      completed: 0,
      withdrawn: 0,
    };

    for (const group of byStatus) {
      const status = group.status.toLowerCase() as keyof typeof statusCounts;
      if (statusCounts[status] !== undefined) {
        statusCounts[status] = group._count.id;
      }
    }

    // Get enrollments by course
    const byCourseRaw = await this.prisma.classEnrollment.groupBy({
      by: ['classId'],
      where,
      _count: { id: true },
    });

    const classIds = byCourseRaw.map((c) => c.classId);
    const classes = await this.prisma.class.findMany({
      where: { id: { in: classIds } },
      select: {
        id: true,
        course: { select: { id: true, title: true } },
      },
    });

    const courseMap = new Map<string, { id: string; title: string; count: number }>();
    for (const c of classes) {
      const existing = courseMap.get(c.course.id);
      const classCount =
        byCourseRaw.find((r) => r.classId === c.id)?._count.id ?? 0;
      if (existing) {
        existing.count += classCount;
      } else {
        courseMap.set(c.course.id, {
          id: c.course.id,
          title: c.course.title,
          count: classCount,
        });
      }
    }

    const byCourse: CourseEnrollment[] = Array.from(courseMap.values()).map(
      (c) => ({
        courseId: c.id,
        courseName: c.title,
        count: c.count,
      }),
    );

    // Get daily trends (last 30 days if no range specified)
    const trendStart =
      query.startDate ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const trendEnd = query.endDate ?? new Date();

    const dailyEnrollments = await this.prisma.$queryRaw<
      Array<{ date: Date; count: bigint }>
    >`
      SELECT DATE(enrolled_at) as date, COUNT(*) as count
      FROM class_enrollments
      WHERE enrolled_at >= ${trendStart} AND enrolled_at <= ${trendEnd}
      ${query.courseId ? Prisma.sql`AND class_id IN (SELECT id FROM classes WHERE course_id = ${query.courseId})` : Prisma.empty}
      GROUP BY DATE(enrolled_at)
      ORDER BY date ASC
    `;

    const daily: DailyEnrollment[] = dailyEnrollments.map((d) => ({
      date: d.date.toISOString().split('T')[0],
      count: Number(d.count),
    }));

    return {
      summary: {
        totalEnrollments: total,
        activeEnrollments: statusCounts.active,
        completedEnrollments: statusCounts.completed,
        withdrawnEnrollments: statusCounts.withdrawn,
      },
      trends: { daily },
      byCourse,
      byStatus: statusCounts,
    };
  }
}

