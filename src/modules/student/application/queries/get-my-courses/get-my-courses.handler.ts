import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMyCoursesQuery } from './get-my-courses.query';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { EnrollmentStatus } from '@prisma/client';

interface StudentClassEnrollment {
  id: string;
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
  type: string;
  packageType: number;
  lessonLimit: number;
  lessonsUnlocked: number;
  lessonsCompleted: number;
  progress: number;
  schedule: unknown;
  startDate: Date;
  endDate: Date | null;
  status: string;
  classmates: { id: string; name: string; avatar: string | null }[];
  nextLesson: { id: string; title: string; estimatedDuration: number } | null;
}

@QueryHandler(GetMyCoursesQuery)
export class GetMyCoursesHandler implements IQueryHandler<GetMyCoursesQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetMyCoursesQuery): Promise<StudentClassEnrollment[]> {
    const { studentId, status } = query;

    const where: Record<string, unknown> = { studentId };
    if (status) {
      where.status = status as EnrollmentStatus;
    }

    const enrollments = await this.prisma.classEnrollment.findMany({
      where,
      include: {
        class: {
          include: {
            course: {
              include: {
                sections: {
                  include: {
                    lessons: {
                      select: {
                        id: true,
                        title: true,
                        orderIndex: true,
                        estimatedDuration: true,
                      },
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
            lessonUnlocks: { select: { lessonId: true } },
            enrollments: {
              where: { status: 'active', studentId: { not: studentId } },
              include: {
                student: { select: { id: true, fullName: true, avatar: true } },
              },
              take: 5,
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    // Get lesson progress for this student
    const lessonProgress = await this.prisma.lessonProgress.findMany({
      where: { userId: studentId },
      select: { lessonId: true, completed: true },
    });

    const completedLessonIds = new Set(
      lessonProgress.filter((lp) => lp.completed).map((lp) => lp.lessonId),
    );

    return enrollments.map((enrollment) => {
      const cls = enrollment.class;
      const course = cls.course;

      const allLessons = course.sections.flatMap((s) => s.lessons);
      const totalLessons = allLessons.length;
      const unlockedLessonIds = new Set(
        cls.lessonUnlocks.map((lu) => lu.lessonId),
      );

      const completedInCourse = allLessons.filter((l) =>
        completedLessonIds.has(l.id),
      ).length;

      const progress =
        totalLessons > 0
          ? Math.round((completedInCourse / totalLessons) * 100)
          : 0;

      const nextLesson = allLessons.find(
        (l) => unlockedLessonIds.has(l.id) && !completedLessonIds.has(l.id),
      );

      const classmates = cls.enrollments
        .filter((e) => e.student)
        .map((e) => ({
          id: e.student.id,
          name: e.student.fullName,
          avatar: e.student.avatar,
        }));

      return {
        id: enrollment.id,
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
        type: cls.type,
        packageType: enrollment.meetingCredits,
        lessonLimit: enrollment.meetingCredits,
        lessonsUnlocked: unlockedLessonIds.size,
        lessonsCompleted: completedInCourse,
        progress,
        schedule: cls.schedule,
        startDate: enrollment.enrolledAt,
        endDate: enrollment.completedAt,
        status: enrollment.status,
        classmates,
        nextLesson: nextLesson
          ? {
              id: nextLesson.id,
              title: nextLesson.title,
              estimatedDuration: nextLesson.estimatedDuration || 30,
            }
          : null,
      };
    });
  }
}
