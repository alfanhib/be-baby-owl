import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetInstructorAnalyticsQuery } from './get-instructor-analytics.query';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

interface OverviewStats {
  totalStudents: number;
  totalClasses: number;
  totalCourses: number;
  completionRate: number;
}

interface ClassPerformance {
  classId: string;
  name: string;
  courseName: string;
  studentCount: number;
  avgProgress: number;
  completionRate: number;
}

interface MonthlyTrend {
  month: string;
  students: number;
  completions: number;
}

interface InstructorAnalyticsResult {
  overview: OverviewStats;
  classPerformance: ClassPerformance[];
  monthlyTrend: MonthlyTrend[];
  courseBreakdown: {
    courseId: string;
    name: string;
    students: number;
    percentage: number;
  }[];
}

@QueryHandler(GetInstructorAnalyticsQuery)
export class GetInstructorAnalyticsHandler implements IQueryHandler<GetInstructorAnalyticsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: GetInstructorAnalyticsQuery,
  ): Promise<InstructorAnalyticsResult> {
    const { instructorId, period } = query;

    // Get date range based on period
    const now = new Date();
    const startDate = new Date();
    if (period === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    // Get all classes for this instructor
    const classes = await this.prisma.class.findMany({
      where: { instructorId },
      include: {
        course: { select: { id: true, title: true } },
        enrollments: {
          include: {
            student: { select: { id: true } },
          },
        },
      },
    });

    // Calculate overview stats
    const totalClasses = classes.length;
    const courseIds = [...new Set(classes.map((c) => c.courseId))];
    const totalCourses = courseIds.length;

    const allEnrollments = classes.flatMap((c) => c.enrollments);
    const totalStudents = allEnrollments.length;
    const uniqueStudentIds = [
      ...new Set(allEnrollments.map((e) => e.studentId)),
    ];

    const completedEnrollments = allEnrollments.filter(
      (e) => e.status === 'completed',
    ).length;
    const completionRate =
      totalStudents > 0
        ? Math.round((completedEnrollments / totalStudents) * 100)
        : 0;

    const overview: OverviewStats = {
      totalStudents: uniqueStudentIds.length,
      totalClasses,
      totalCourses,
      completionRate,
    };

    // Class performance
    const classPerformance: ClassPerformance[] = classes.map((cls) => {
      const studentCount = cls.enrollments.length;
      const completed = cls.enrollments.filter(
        (e) => e.status === 'completed',
      ).length;

      // Calculate average progress
      const totalProgress = cls.enrollments.reduce((acc, e) => {
        const progress =
          cls.lessonsUnlocked > 0
            ? (e.lessonsCompleted / cls.lessonsUnlocked) * 100
            : 0;
        return acc + progress;
      }, 0);

      const avgProgress =
        studentCount > 0 ? Math.round(totalProgress / studentCount) : 0;
      const clsCompletionRate =
        studentCount > 0 ? Math.round((completed / studentCount) * 100) : 0;

      return {
        classId: cls.id,
        name: cls.name,
        courseName: cls.course.title,
        studentCount,
        avgProgress,
        completionRate: clsCompletionRate,
      };
    });

    // Monthly trend (last 6 months)
    const monthlyTrend: MonthlyTrend[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      const monthStart = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth(),
        1,
      );
      const monthEnd = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth() + 1,
        0,
      );

      const monthEnrollments = allEnrollments.filter((e) => {
        const enrolledAt = new Date(e.enrolledAt);
        return enrolledAt >= monthStart && enrolledAt <= monthEnd;
      });

      const monthCompletions = allEnrollments.filter((e) => {
        if (!e.completedAt) return false;
        const completedAt = new Date(e.completedAt);
        return completedAt >= monthStart && completedAt <= monthEnd;
      });

      monthlyTrend.push({
        month: monthDate.toLocaleString('default', { month: 'short' }),
        students: monthEnrollments.length,
        completions: monthCompletions.length,
      });
    }

    // Course breakdown
    const courseStudentCounts = new Map<
      string,
      { name: string; count: number }
    >();
    for (const cls of classes) {
      const existing = courseStudentCounts.get(cls.courseId) || {
        name: cls.course.title,
        count: 0,
      };
      existing.count += cls.enrollments.length;
      courseStudentCounts.set(cls.courseId, existing);
    }

    const courseBreakdown = Array.from(courseStudentCounts.entries()).map(
      ([courseId, data]) => ({
        courseId,
        name: data.name,
        students: data.count,
        percentage:
          totalStudents > 0
            ? Math.round((data.count / totalStudents) * 100)
            : 0,
      }),
    );

    return {
      overview,
      classPerformance,
      monthlyTrend,
      courseBreakdown,
    };
  }
}
