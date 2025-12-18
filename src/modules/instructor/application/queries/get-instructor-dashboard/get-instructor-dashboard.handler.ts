import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetInstructorDashboardQuery } from './get-instructor-dashboard.query';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { ClassStatus } from '@prisma/client';

interface InstructorClassSummary {
  id: string;
  name: string;
  courseName: string;
  courseId: string;
  studentCount: number;
  maxCapacity: number;
  progress: number;
  lessonsUnlocked: number;
  totalLessons: number;
  status: string;
  schedule: string;
}

interface PendingTask {
  id: string;
  type: string;
  title: string;
  description: string;
  className: string;
  classId: string;
  priority: 'high' | 'medium' | 'low';
  actionUrl: string;
}

interface StudentStats {
  totalStudents: number;
  activeStudents: number;
  avgCompletionRate: number;
  atRiskStudents: number;
}

interface UpcomingMeeting {
  id: string;
  classId: string;
  className: string;
  courseName: string;
  date: string;
  attendeeCount: number;
  totalStudents: number;
}

interface InstructorDashboardResult {
  classes: InstructorClassSummary[];
  pendingTasks: PendingTask[];
  studentStats: StudentStats;
  upcomingMeetings: UpcomingMeeting[];
}

@QueryHandler(GetInstructorDashboardQuery)
export class GetInstructorDashboardHandler implements IQueryHandler<GetInstructorDashboardQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: GetInstructorDashboardQuery,
  ): Promise<InstructorDashboardResult> {
    const { instructorId } = query;

    // Get instructor's classes
    const classes = await this.prisma.class.findMany({
      where: { instructorId },
      include: {
        course: {
          select: { id: true, title: true },
          include: {
            sections: {
              include: { lessons: { select: { id: true } } },
            },
          },
        },
        enrollments: {
          where: { status: 'active' },
          select: {
            id: true,
            lessonsCompleted: true,
            student: { select: { id: true, fullName: true } },
          },
        },
        lessonUnlocks: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Map classes to summary
    const classSummaries: InstructorClassSummary[] = classes.map((cls) => {
      const totalLessons = cls.course.sections.reduce(
        (acc, section) => acc + section.lessons.length,
        0,
      );

      const avgProgress =
        cls.enrollments.length > 0
          ? Math.round(
              cls.enrollments.reduce((acc, e) => {
                const studentProgress =
                  totalLessons > 0
                    ? (e.lessonsCompleted / totalLessons) * 100
                    : 0;
                return acc + studentProgress;
              }, 0) / cls.enrollments.length,
            )
          : 0;

      const schedule =
        typeof cls.schedule === 'object' && cls.schedule
          ? `${(cls.schedule as { days?: string[] }).days?.join(' & ') || ''}, ${(cls.schedule as { time?: string }).time || ''}`
          : '';

      return {
        id: cls.id,
        name: cls.name,
        courseName: cls.course.title,
        courseId: cls.courseId,
        studentCount: cls.currentCapacity,
        maxCapacity: cls.maxCapacity,
        progress: avgProgress,
        lessonsUnlocked: cls.lessonUnlocks.length,
        totalLessons,
        status: cls.status,
        schedule,
      };
    });

    // Calculate student stats
    const totalStudents = classes.reduce(
      (acc, cls) => acc + cls.enrollments.length,
      0,
    );
    const activeClasses = classes.filter(
      (c) => c.status === ClassStatus.active,
    );
    const activeStudents = activeClasses.reduce(
      (acc, cls) => acc + cls.enrollments.length,
      0,
    );

    // At-risk: students with no progress in active classes
    const atRiskCount = activeClasses.reduce((acc, cls) => {
      const atRisk = cls.enrollments.filter((e) => e.lessonsCompleted === 0);
      return acc + atRisk.length;
    }, 0);

    const avgCompletionRate =
      classSummaries.length > 0
        ? Math.round(
            classSummaries.reduce((acc, c) => acc + c.progress, 0) /
              classSummaries.length,
          )
        : 0;

    const studentStats: StudentStats = {
      totalStudents,
      activeStudents,
      avgCompletionRate,
      atRiskStudents: atRiskCount,
    };

    // Pending tasks: lessons that could be unlocked
    const pendingTasks: PendingTask[] = [];

    for (const cls of activeClasses) {
      const totalLessons = cls.course.sections.reduce(
        (acc, section) => acc + section.lessons.length,
        0,
      );

      if (
        cls.lessonUnlocks.length < cls.meetingsCompleted &&
        cls.lessonUnlocks.length < totalLessons
      ) {
        pendingTasks.push({
          id: `unlock-${cls.id}`,
          type: 'unlock_lesson',
          title: 'Unlock Next Lesson',
          description: `${cls.lessonUnlocks.length}/${totalLessons} lessons unlocked`,
          className: cls.name,
          classId: cls.id,
          priority: 'medium',
          actionUrl: `/instructor/classes/${cls.id}/unlock`,
        });
      }
    }

    // Upcoming meetings (next 7 days from active classes)
    const upcomingMeetings: UpcomingMeeting[] = activeClasses
      .filter((cls) => cls.meetingsCompleted < cls.totalMeetings)
      .slice(0, 5)
      .map((cls) => ({
        id: `meeting-${cls.id}`,
        classId: cls.id,
        className: cls.name,
        courseName: cls.course.title,
        date: new Date().toISOString().split('T')[0],
        attendeeCount: cls.enrollments.length,
        totalStudents: cls.maxCapacity,
      }));

    return {
      classes: classSummaries.slice(0, 5),
      pendingTasks: pendingTasks.slice(0, 10),
      studentStats,
      upcomingMeetings,
    };
  }
}
