import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetStudentDashboardQuery } from './get-student-dashboard.query';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

interface CourseProgress {
  enrollmentId: string;
  classId: string;
  className: string;
  course: {
    id: string;
    title: string;
    coverImage: string | null;
  };
  instructor: {
    id: string;
    name: string;
    avatar: string | null;
  };
  lessonsCompleted: number;
  lessonsUnlocked: number;
  totalLessons: number;
  progress: number;
  status: string;
  nextLesson: {
    id: string;
    title: string;
  } | null;
  enrolledAt: Date;
}

interface StudentStats {
  totalLessonsCompleted: number;
  totalCoursesEnrolled: number;
  activeEnrollments: number;
  completedEnrollments: number;
  totalXp: number;
  currentLevel: number;
  currentStreak: number;
}

interface UpcomingClass {
  classId: string;
  className: string;
  courseName: string;
  schedule: unknown;
  instructorName: string;
}

interface RecentActivity {
  type: string;
  title: string;
  description: string;
  timestamp: Date;
}

interface StudentDashboardResult {
  courses: CourseProgress[];
  stats: StudentStats;
  upcomingClasses: UpcomingClass[];
  recentActivity: RecentActivity[];
}

@QueryHandler(GetStudentDashboardQuery)
export class GetStudentDashboardHandler implements IQueryHandler<GetStudentDashboardQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: GetStudentDashboardQuery,
  ): Promise<StudentDashboardResult> {
    const { studentId } = query;

    // Get student's enrollments with class and course details
    const enrollments = await this.prisma.classEnrollment.findMany({
      where: { studentId },
      include: {
        class: {
          include: {
            course: {
              include: {
                sections: {
                  include: {
                    lessons: {
                      select: { id: true, title: true, orderIndex: true },
                      orderBy: { orderIndex: 'asc' },
                    },
                  },
                  orderBy: { orderIndex: 'asc' },
                },
              },
            },
            instructor: {
              select: { id: true, fullName: true, avatar: true },
            },
            lessonUnlocks: {
              select: { lessonId: true },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    // Get lesson progress for this student
    const lessonProgress = await this.prisma.lessonProgress.findMany({
      where: { userId: studentId },
      select: { lessonId: true, completed: true, completedAt: true },
    });

    const completedLessonIds = new Set(
      lessonProgress.filter((lp) => lp.completed).map((lp) => lp.lessonId),
    );

    // Map enrollments to course progress
    const courses: CourseProgress[] = enrollments.map((enrollment) => {
      const cls = enrollment.class;
      const course = cls.course;

      // Flatten all lessons
      const allLessons = course.sections.flatMap((s) => s.lessons);
      const totalLessons = allLessons.length;

      // Unlocked lesson IDs
      const unlockedLessonIds = new Set(
        cls.lessonUnlocks.map((lu) => lu.lessonId),
      );

      // Completed lessons in this course
      const completedInCourse = allLessons.filter((l) =>
        completedLessonIds.has(l.id),
      ).length;

      // Progress percentage
      const progress =
        totalLessons > 0
          ? Math.round((completedInCourse / totalLessons) * 100)
          : 0;

      // Find next lesson (first unlocked but not completed)
      const nextLesson = allLessons.find(
        (l) => unlockedLessonIds.has(l.id) && !completedLessonIds.has(l.id),
      );

      return {
        enrollmentId: enrollment.id,
        classId: cls.id,
        className: cls.name,
        course: {
          id: course.id,
          title: course.title,
          coverImage: course.coverImage,
        },
        instructor: {
          id: cls.instructor?.id || '',
          name: cls.instructor?.fullName || 'TBA',
          avatar: cls.instructor?.avatar || null,
        },
        lessonsCompleted: completedInCourse,
        lessonsUnlocked: unlockedLessonIds.size,
        totalLessons,
        progress,
        status: enrollment.status,
        nextLesson: nextLesson
          ? { id: nextLesson.id, title: nextLesson.title }
          : null,
        enrolledAt: enrollment.enrolledAt,
      };
    });

    // Calculate stats
    const totalLessonsCompleted = completedLessonIds.size;
    const totalCoursesEnrolled = enrollments.length;
    const activeEnrollments = enrollments.filter(
      (e) => e.status === 'active',
    ).length;
    const completedEnrollments = enrollments.filter(
      (e) => e.status === 'completed',
    ).length;

    // Gamification stats (placeholder - to be implemented with Gamification module)
    const stats: StudentStats = {
      totalLessonsCompleted,
      totalCoursesEnrolled,
      activeEnrollments,
      completedEnrollments,
      totalXp: 0, // TODO: implement with Gamification module
      currentLevel: 1,
      currentStreak: 0,
    };

    // Upcoming classes (active enrollments)
    const upcomingClasses: UpcomingClass[] = enrollments
      .filter((e) => e.status === 'active')
      .slice(0, 5)
      .map((e) => ({
        classId: e.class.id,
        className: e.class.name,
        courseName: e.class.course.title,
        schedule: e.class.schedule,
        instructorName: e.class.instructor?.fullName || 'TBA',
      }));

    // Recent activity (last 10 completed lessons)
    const recentLessonProgress = await this.prisma.lessonProgress.findMany({
      where: { userId: studentId, completed: true },
      include: {
        lesson: { select: { title: true } },
      },
      orderBy: { completedAt: 'desc' },
      take: 10,
    });

    const recentActivity: RecentActivity[] = recentLessonProgress.map((lp) => ({
      type: 'lesson_completed',
      title: 'Lesson Completed',
      description: lp.lesson.title,
      timestamp: lp.completedAt || lp.updatedAt,
    }));

    return {
      courses: courses.slice(0, 5), // Show top 5 on dashboard
      stats,
      upcomingClasses,
      recentActivity,
    };
  }
}
