import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetInstructorClassesQuery } from './get-instructor-classes.query';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { ClassStatus } from '@prisma/client';

interface InstructorClass {
  id: string;
  name: string;
  courseName: string;
  courseId: string;
  type: string;
  status: string;
  studentCount: number;
  maxCapacity: number;
  lessonsUnlocked: number;
  totalLessons: number;
  meetingsCompleted: number;
  totalMeetings: number;
  schedule: unknown;
  startDate: Date | null;
  endDate: Date | null;
}

@QueryHandler(GetInstructorClassesQuery)
export class GetInstructorClassesHandler implements IQueryHandler<GetInstructorClassesQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetInstructorClassesQuery): Promise<InstructorClass[]> {
    const { instructorId, status, courseId } = query;

    const where: Record<string, unknown> = { instructorId };

    if (status) {
      where.status = status as ClassStatus;
    }

    if (courseId) {
      where.courseId = courseId;
    }

    const classes = await this.prisma.class.findMany({
      where,
      include: {
        course: {
          select: { id: true, title: true },
          include: {
            sections: {
              include: { lessons: { select: { id: true } } },
            },
          },
        },
        lessonUnlocks: { select: { id: true } },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });

    return classes.map((cls) => {
      const totalLessons = cls.course.sections.reduce(
        (acc, section) => acc + section.lessons.length,
        0,
      );

      return {
        id: cls.id,
        name: cls.name,
        courseName: cls.course.title,
        courseId: cls.courseId,
        type: cls.type,
        status: cls.status,
        studentCount: cls.currentCapacity,
        maxCapacity: cls.maxCapacity,
        lessonsUnlocked: cls.lessonUnlocks.length,
        totalLessons,
        meetingsCompleted: cls.meetingsCompleted,
        totalMeetings: cls.totalMeetings,
        schedule: cls.schedule,
        startDate: cls.startDate,
        endDate: cls.endDate,
      };
    });
  }
}
