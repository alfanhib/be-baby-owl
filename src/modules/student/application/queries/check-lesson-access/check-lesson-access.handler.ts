import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CheckLessonAccessQuery } from './check-lesson-access.query';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

interface LessonAccessResult {
  canAccess: boolean;
  reason?: string;
  unlocksOn?: string;
}

@QueryHandler(CheckLessonAccessQuery)
export class CheckLessonAccessHandler implements IQueryHandler<CheckLessonAccessQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: CheckLessonAccessQuery): Promise<LessonAccessResult> {
    const { studentId, classId, lessonId } = query;

    // Check enrollment
    const enrollment = await this.prisma.classEnrollment.findFirst({
      where: { studentId, classId, status: 'active' },
    });

    if (!enrollment) {
      return {
        canAccess: false,
        reason: 'Not enrolled in this class',
      };
    }

    // Check if lesson exists in the class's course
    const cls = await this.prisma.class.findUnique({
      where: { id: classId },
      include: {
        course: {
          include: {
            sections: {
              include: {
                lessons: { select: { id: true, orderIndex: true } },
              },
            },
          },
        },
        lessonUnlocks: { select: { lessonId: true } },
      },
    });

    if (!cls) {
      return {
        canAccess: false,
        reason: 'Class not found',
      };
    }

    // Check if lesson belongs to this course
    const allLessons = cls.course.sections.flatMap((s) => s.lessons);
    const lessonExists = allLessons.some((l) => l.id === lessonId);

    if (!lessonExists) {
      return {
        canAccess: false,
        reason: 'Lesson not found in this course',
      };
    }

    // Check if lesson is unlocked
    const isUnlocked = cls.lessonUnlocks.some((lu) => lu.lessonId === lessonId);

    if (!isUnlocked) {
      return {
        canAccess: false,
        reason: 'Lesson not yet unlocked by instructor',
        unlocksOn: 'Contact your instructor',
      };
    }

    // Check package limit (lesson order vs meeting credits)
    const lesson = allLessons.find((l) => l.id === lessonId);
    if (lesson && lesson.orderIndex > enrollment.meetingCredits) {
      return {
        canAccess: false,
        reason: 'Package limit reached',
        unlocksOn: 'Upgrade your package to access more lessons',
      };
    }

    return { canAccess: true };
  }
}
