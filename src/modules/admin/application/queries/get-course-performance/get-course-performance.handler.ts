import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCoursePerformanceQuery } from './get-course-performance.query';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { CourseStatus, ClassStatus, PaymentStatus } from '@prisma/client';

interface CoursePerformanceItem {
  courseId: string;
  courseName: string;
  status: string;
  totalClasses: number;
  activeClasses: number;
  completedClasses: number;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  revenue: number;
  averageCompletion: number;
  rating: number;
}

export interface CoursePerformanceReportDto {
  summary: {
    totalCourses: number;
    publishedCourses: number;
    totalRevenue: number;
    totalEnrollments: number;
    averageCompletion: number;
  };
  courses: CoursePerformanceItem[];
  topPerforming: CoursePerformanceItem[];
  needsAttention: CoursePerformanceItem[];
  period: {
    start: Date;
    end: Date;
  };
}

@QueryHandler(GetCoursePerformanceQuery)
export class GetCoursePerformanceHandler implements IQueryHandler<GetCoursePerformanceQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: GetCoursePerformanceQuery,
  ): Promise<CoursePerformanceReportDto> {
    const now = new Date();
    const startDate = query.startDate || new Date(now.getFullYear(), 0, 1);
    const endDate = query.endDate || now;

    // Get all courses with their classes
    const courses = await this.prisma.course.findMany({
      include: {
        classes: {
          include: {
            enrollments: true,
          },
        },
      },
    });

    // Get payment data by course
    const payments = await this.prisma.payment.findMany({
      where: {
        status: PaymentStatus.verified,
        courseId: { not: null },
        createdAt: { gte: startDate, lte: endDate },
      },
      select: {
        courseId: true,
        amount: true,
      },
    });

    const revenueByCourseid = new Map<string, number>();
    for (const payment of payments) {
      if (!payment.courseId) continue;
      const current = revenueByCourseid.get(payment.courseId) || 0;
      revenueByCourseid.set(payment.courseId, current + Number(payment.amount));
    }

    // Build course performance items
    const courseItems: CoursePerformanceItem[] = courses.map((course) => {
      const activeClasses = course.classes.filter(
        (c) => c.status === ClassStatus.active,
      ).length;
      const completedClasses = course.classes.filter(
        (c) => c.status === ClassStatus.completed,
      ).length;

      const allEnrollments = course.classes.flatMap((c) => c.enrollments);
      const activeEnrollments = allEnrollments.filter(
        (e) => e.status === 'active',
      ).length;
      const completedEnrollments = allEnrollments.filter(
        (e) => e.status === 'completed',
      ).length;

      const revenue = revenueByCourseid.get(course.id) || 0;

      // Calculate average completion (simplified)
      const avgCompletion =
        allEnrollments.length > 0
          ? Math.round((completedEnrollments / allEnrollments.length) * 100)
          : 0;

      return {
        courseId: course.id,
        courseName: course.title,
        status: course.status,
        totalClasses: course.classes.length,
        activeClasses,
        completedClasses,
        totalEnrollments: allEnrollments.length,
        activeEnrollments,
        completedEnrollments,
        revenue,
        averageCompletion: avgCompletion,
        rating: 4.5, // Placeholder - would need rating system
      };
    });

    // Calculate summary
    const totalCourses = courses.length;
    const publishedCourses = courses.filter(
      (c) => c.status === CourseStatus.published,
    ).length;
    const totalRevenue = courseItems.reduce((sum, c) => sum + c.revenue, 0);
    const totalEnrollments = courseItems.reduce(
      (sum, c) => sum + c.totalEnrollments,
      0,
    );
    const averageCompletion =
      courseItems.length > 0
        ? Math.round(
            courseItems.reduce((sum, c) => sum + c.averageCompletion, 0) /
              courseItems.length,
          )
        : 0;

    // Sort for top performing (by revenue and enrollments)
    const topPerforming = [...courseItems]
      .sort(
        (a, b) =>
          b.revenue - a.revenue || b.totalEnrollments - a.totalEnrollments,
      )
      .slice(0, 5);

    // Courses needing attention (low completion, no enrollments)
    const needsAttention = courseItems
      .filter(
        (c) =>
          c.status === CourseStatus.published.toString() &&
          (c.averageCompletion < 50 || c.totalEnrollments === 0),
      )
      .slice(0, 5);

    return {
      summary: {
        totalCourses,
        publishedCourses,
        totalRevenue,
        totalEnrollments,
        averageCompletion,
      },
      courses: courseItems,
      topPerforming,
      needsAttention,
      period: {
        start: startDate,
        end: endDate,
      },
    };
  }
}
