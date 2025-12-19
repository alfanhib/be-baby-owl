import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { GetCourseDetailQuery } from './get-course-detail.query';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

interface LessonInfo {
  id: string;
  title: string;
  orderIndex: number;
  estimatedDuration: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  completedAt: Date | null;
}

interface SectionInfo {
  id: string;
  title: string;
  orderIndex: number;
  lessons: LessonInfo[];
  completedCount: number;
  totalCount: number;
}

interface CourseDetailResult {
  enrollmentId: string;
  classId: string;
  className: string;
  course: {
    id: string;
    title: string;
    description: string | null;
    coverImage: string | null;
  };
  instructor: {
    id: string;
    name: string;
    avatar: string | null;
    bio: string | null;
  };
  sections: SectionInfo[];
  progress: {
    lessonsCompleted: number;
    lessonsUnlocked: number;
    totalLessons: number;
    percentage: number;
  };
  nextLesson: { id: string; title: string; sectionTitle: string } | null;
  status: string;
  schedule: unknown;
}

@QueryHandler(GetCourseDetailQuery)
export class GetCourseDetailHandler implements IQueryHandler<GetCourseDetailQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetCourseDetailQuery): Promise<CourseDetailResult> {
    const { studentId, classId } = query;

    // Get enrollment
    const enrollment = await this.prisma.classEnrollment.findFirst({
      where: { studentId, classId },
    });

    if (!enrollment) {
      throw new ForbiddenException('You are not enrolled in this class');
    }

    // Get class with course details
    const cls = await this.prisma.class.findUnique({
      where: { id: classId },
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
          select: { id: true, fullName: true, avatar: true, bio: true },
        },
        lessonUnlocks: { select: { lessonId: true } },
      },
    });

    if (!cls) {
      throw new NotFoundException('Class not found');
    }

    // Get lesson progress for this student
    const lessonProgress = await this.prisma.lessonProgress.findMany({
      where: { userId: studentId },
      select: { lessonId: true, completed: true, completedAt: true },
    });

    const progressMap = new Map(lessonProgress.map((lp) => [lp.lessonId, lp]));
    const unlockedLessonIds = new Set(
      cls.lessonUnlocks.map((lu) => lu.lessonId),
    );

    let totalLessons = 0;
    let lessonsCompleted = 0;
    let nextLesson: { id: string; title: string; sectionTitle: string } | null =
      null;

    const sections: SectionInfo[] = cls.course.sections.map((section) => {
      const lessons: LessonInfo[] = section.lessons.map((lesson) => {
        totalLessons++;
        const progress = progressMap.get(lesson.id);
        const isCompleted = progress?.completed || false;
        const isUnlocked = unlockedLessonIds.has(lesson.id);

        if (isCompleted) {
          lessonsCompleted++;
        }

        // Track next lesson (first unlocked but not completed)
        if (!nextLesson && isUnlocked && !isCompleted) {
          nextLesson = {
            id: lesson.id,
            title: lesson.title,
            sectionTitle: section.title,
          };
        }

        return {
          id: lesson.id,
          title: lesson.title,
          orderIndex: lesson.orderIndex,
          estimatedDuration: lesson.estimatedDuration || 30,
          isUnlocked,
          isCompleted,
          completedAt: progress?.completedAt || null,
        };
      });

      const completedCount = lessons.filter((l) => l.isCompleted).length;

      return {
        id: section.id,
        title: section.title,
        orderIndex: section.orderIndex,
        lessons,
        completedCount,
        totalCount: lessons.length,
      };
    });

    const percentage =
      totalLessons > 0
        ? Math.round((lessonsCompleted / totalLessons) * 100)
        : 0;

    return {
      enrollmentId: enrollment.id,
      classId: cls.id,
      className: cls.name,
      course: {
        id: cls.course.id,
        title: cls.course.title,
        description: cls.course.description,
        coverImage: cls.course.coverImage,
      },
      instructor: {
        id: cls.instructor?.id || '',
        name: cls.instructor?.fullName || 'TBA',
        avatar: cls.instructor?.avatar || null,
        bio: cls.instructor?.bio || null,
      },
      sections,
      progress: {
        lessonsCompleted,
        lessonsUnlocked: unlockedLessonIds.size,
        totalLessons,
        percentage,
      },
      nextLesson,
      status: enrollment.status,
      schedule: cls.schedule,
    };
  }
}
