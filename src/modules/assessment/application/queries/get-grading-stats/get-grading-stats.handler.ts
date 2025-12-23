import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { GetGradingStatsQuery } from './get-grading-stats.query';

export interface GradingStatsDto {
  pendingCount: number;
  gradedTodayCount: number;
  gradedThisWeekCount: number;
  totalGradedCount: number;
  averageGradePercentage: number | null;
}

@QueryHandler(GetGradingStatsQuery)
export class GetGradingStatsHandler implements IQueryHandler<GetGradingStatsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetGradingStatsQuery): Promise<GradingStatsDto> {
    const { instructorId, classId } = query;

    // Get classes taught by this instructor
    const classFilter = classId ? { id: classId } : { instructorId };

    const instructorClasses = await this.prisma.class.findMany({
      where: classFilter,
      select: { id: true, courseId: true },
    });

    const classIds = instructorClasses.map((c) => c.id);
    const courseIds = [...new Set(instructorClasses.map((c) => c.courseId))];

    // Get enrolled students
    const enrollments = await this.prisma.classEnrollment.findMany({
      where: { classId: { in: classIds }, status: 'active' },
      select: { studentId: true },
    });

    const studentIds = [...new Set(enrollments.map((e) => e.studentId))];

    // Get assignment exercises in instructor's courses
    const exercises = await this.prisma.exercise.findMany({
      where: {
        type: 'assignment',
        lesson: {
          section: { courseId: { in: courseIds } },
        },
      },
      select: { id: true },
    });

    const exerciseIds = exercises.map((e) => e.id);

    // Calculate date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    // Get stats
    const [
      pendingCount,
      gradedTodayCount,
      gradedThisWeekCount,
      totalGradedCount,
      averageGrade,
    ] = await Promise.all([
      this.prisma.assignmentSubmission.count({
        where: {
          status: 'pending',
          studentId: { in: studentIds },
          exerciseId: { in: exerciseIds },
        },
      }),
      this.prisma.assignmentSubmission.count({
        where: {
          status: 'graded',
          studentId: { in: studentIds },
          exerciseId: { in: exerciseIds },
          gradedAt: { gte: today },
        },
      }),
      this.prisma.assignmentSubmission.count({
        where: {
          status: 'graded',
          studentId: { in: studentIds },
          exerciseId: { in: exerciseIds },
          gradedAt: { gte: weekAgo },
        },
      }),
      this.prisma.assignmentSubmission.count({
        where: {
          status: 'graded',
          studentId: { in: studentIds },
          exerciseId: { in: exerciseIds },
        },
      }),
      this.prisma.assignmentSubmission.aggregate({
        where: {
          status: 'graded',
          studentId: { in: studentIds },
          exerciseId: { in: exerciseIds },
          grade: { not: null },
          maxGrade: { not: null },
        },
        _avg: {
          grade: true,
          maxGrade: true,
        },
      }),
    ]);

    // Calculate average percentage
    const avgGrade = averageGrade._avg.grade;
    const avgMaxGrade = averageGrade._avg.maxGrade;
    const averageGradePercentage =
      avgGrade !== null && avgMaxGrade !== null && avgMaxGrade > 0
        ? Math.round((avgGrade / avgMaxGrade) * 100)
        : null;

    return {
      pendingCount,
      gradedTodayCount,
      gradedThisWeekCount,
      totalGradedCount,
      averageGradePercentage,
    };
  }
}
