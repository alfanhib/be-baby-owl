import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUnlockedLessonsQuery } from './get-unlocked-lessons.query';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

export interface UnlockedLessonItem {
  lessonUnlockId: string;
  lessonId: string;
  lessonTitle: string;
  sectionId: string;
  sectionTitle: string;
  orderIndex: number;
  unlockedBy: string;
  unlockedByName: string;
  unlockedAt: Date;
}

export interface UnlockedLessonsResult {
  classId: string;
  className: string;
  courseId: string;
  courseTitle: string;
  totalMeetings: number;
  lessonsUnlocked: number;
  lessons: UnlockedLessonItem[];
}

@QueryHandler(GetUnlockedLessonsQuery)
export class GetUnlockedLessonsHandler implements IQueryHandler<GetUnlockedLessonsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: GetUnlockedLessonsQuery,
  ): Promise<UnlockedLessonsResult | null> {
    const classEntity = await this.prisma.class.findUnique({
      where: { id: query.classId },
      include: {
        course: { select: { id: true, title: true } },
        lessonUnlocks: {
          include: {
            lesson: {
              include: {
                section: { select: { id: true, title: true } },
              },
            },
            unlockedByUser: { select: { fullName: true } },
          },
          orderBy: { unlockedAt: 'asc' },
        },
      },
    });

    if (!classEntity) {
      return null;
    }

    const lessons: UnlockedLessonItem[] = classEntity.lessonUnlocks.map(
      (unlock) => ({
        lessonUnlockId: unlock.id,
        lessonId: unlock.lessonId,
        lessonTitle: unlock.lesson.title,
        sectionId: unlock.lesson.section.id,
        sectionTitle: unlock.lesson.section.title,
        orderIndex: unlock.lesson.orderIndex,
        unlockedBy: unlock.unlockedBy,
        unlockedByName: unlock.unlockedByUser.fullName,
        unlockedAt: unlock.unlockedAt,
      }),
    );

    return {
      classId: classEntity.id,
      className: classEntity.name,
      courseId: classEntity.course.id,
      courseTitle: classEntity.course.title,
      totalMeetings: classEntity.totalMeetings,
      lessonsUnlocked: lessons.length,
      lessons,
    };
  }
}
