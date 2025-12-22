import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { GetSystemAnalyticsQuery } from './get-system-analytics.query';

export interface SystemAnalyticsDto {
  users: {
    total: number;
    students: number;
    instructors: number;
    staff: number;
    newThisMonth: number;
  };
  enrollments: {
    total: number;
    active: number;
    completed: number;
    withdrawn: number;
    newThisMonth: number;
  };
  courses: {
    total: number;
    published: number;
    draft: number;
    avgCompletionRate: number | null;
  };
  classes: {
    total: number;
    active: number;
    completed: number;
    avgCapacityUtilization: number | null;
  };
  payments: {
    total: number;
    totalRevenue: number;
    pendingCount: number;
    verifiedCount: number;
    revenueThisMonth: number;
  };
  submissions: {
    total: number;
    pending: number;
    graded: number;
    avgGradePercentage: number | null;
  };
}

@QueryHandler(GetSystemAnalyticsQuery)
export class GetSystemAnalyticsHandler
  implements IQueryHandler<GetSystemAnalyticsQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<SystemAnalyticsDto> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Users analytics
    const [
      totalUsers,
      studentsCount,
      instructorsCount,
      staffCount,
      newUsersThisMonth,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'student' } }),
      this.prisma.user.count({ where: { role: 'instructor' } }),
      this.prisma.user.count({ where: { role: 'staff' } }),
      this.prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
    ]);

    // Enrollments analytics
    const [
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      withdrawnEnrollments,
      newEnrollmentsThisMonth,
    ] = await Promise.all([
      this.prisma.classEnrollment.count(),
      this.prisma.classEnrollment.count({ where: { status: 'active' } }),
      this.prisma.classEnrollment.count({ where: { status: 'completed' } }),
      this.prisma.classEnrollment.count({ where: { status: 'withdrawn' } }),
      this.prisma.classEnrollment.count({
        where: { enrolledAt: { gte: monthStart } },
      }),
    ]);

    // Courses analytics
    const [totalCourses, publishedCourses, draftCourses] = await Promise.all([
      this.prisma.course.count(),
      this.prisma.course.count({ where: { status: 'published' } }),
      this.prisma.course.count({ where: { status: 'draft' } }),
    ]);

    // Classes analytics
    const [totalClasses, activeClasses, completedClasses, classCapacity] =
      await Promise.all([
        this.prisma.class.count(),
        this.prisma.class.count({ where: { status: 'active' } }),
        this.prisma.class.count({ where: { status: 'completed' } }),
        this.prisma.class.aggregate({
          _avg: { currentCapacity: true, maxCapacity: true },
        }),
      ]);

    const avgCapacity = classCapacity._avg.currentCapacity;
    const avgMaxCapacity = classCapacity._avg.maxCapacity;
    const avgCapacityUtilization =
      avgCapacity && avgMaxCapacity && avgMaxCapacity > 0
        ? Math.round((avgCapacity / avgMaxCapacity) * 100)
        : null;

    // Payments analytics
    const [
      totalPayments,
      pendingPayments,
      verifiedPayments,
      totalRevenue,
      revenueThisMonth,
    ] = await Promise.all([
      this.prisma.payment.count(),
      this.prisma.payment.count({ where: { status: 'pending' } }),
      this.prisma.payment.count({ where: { status: 'verified' } }),
      this.prisma.payment.aggregate({
        where: { status: 'verified' },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { status: 'verified', createdAt: { gte: monthStart } },
        _sum: { amount: true },
      }),
    ]);

    // Submissions analytics
    const [totalSubmissions, pendingSubmissions, gradedSubmissions, avgGrade] =
      await Promise.all([
        this.prisma.assignmentSubmission.count(),
        this.prisma.assignmentSubmission.count({ where: { status: 'pending' } }),
        this.prisma.assignmentSubmission.count({ where: { status: 'graded' } }),
        this.prisma.assignmentSubmission.aggregate({
          where: { status: 'graded', grade: { not: null }, maxGrade: { not: null } },
          _avg: { grade: true, maxGrade: true },
        }),
      ]);

    const avgGradeValue = avgGrade._avg.grade;
    const avgMaxGradeValue = avgGrade._avg.maxGrade;
    const avgGradePercentage =
      avgGradeValue !== null && avgMaxGradeValue !== null && avgMaxGradeValue > 0
        ? Math.round((avgGradeValue / avgMaxGradeValue) * 100)
        : null;

    return {
      users: {
        total: totalUsers,
        students: studentsCount,
        instructors: instructorsCount,
        staff: staffCount,
        newThisMonth: newUsersThisMonth,
      },
      enrollments: {
        total: totalEnrollments,
        active: activeEnrollments,
        completed: completedEnrollments,
        withdrawn: withdrawnEnrollments,
        newThisMonth: newEnrollmentsThisMonth,
      },
      courses: {
        total: totalCourses,
        published: publishedCourses,
        draft: draftCourses,
        avgCompletionRate: null, // TODO: Calculate from lesson progress
      },
      classes: {
        total: totalClasses,
        active: activeClasses,
        completed: completedClasses,
        avgCapacityUtilization,
      },
      payments: {
        total: totalPayments,
        totalRevenue: Number(totalRevenue._sum.amount) || 0,
        pendingCount: pendingPayments,
        verifiedCount: verifiedPayments,
        revenueThisMonth: Number(revenueThisMonth._sum.amount) || 0,
      },
      submissions: {
        total: totalSubmissions,
        pending: pendingSubmissions,
        graded: gradedSubmissions,
        avgGradePercentage,
      },
    };
  }
}

