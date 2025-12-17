import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetClassQuery } from './get-class.query';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

export interface ClassDetailResult {
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  instructorId: string;
  instructorName: string;
  type: string;
  status: string;
  totalMeetings: number;
  meetingsCompleted: number;
  maxCapacity: number;
  currentCapacity: number;
  schedule: unknown;
  startDate: Date | null;
  endDate: Date | null;
  enrollmentDeadline: Date | null;
  lessonsUnlocked: number;
  createdAt: Date;
  updatedAt: Date;
}

@QueryHandler(GetClassQuery)
export class GetClassHandler implements IQueryHandler<GetClassQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetClassQuery): Promise<ClassDetailResult | null> {
    const classEntity = await this.prisma.class.findUnique({
      where: { id: query.classId },
      include: {
        course: { select: { title: true } },
        instructor: { select: { fullName: true } },
        enrollments: { where: { status: 'active' } },
        lessonUnlocks: true,
      },
    });

    if (!classEntity) {
      return null;
    }

    return {
      id: classEntity.id,
      name: classEntity.name,
      courseId: classEntity.courseId,
      courseName: classEntity.course.title,
      instructorId: classEntity.instructorId,
      instructorName: classEntity.instructor.fullName,
      type: classEntity.type,
      status: classEntity.status,
      totalMeetings: classEntity.totalMeetings,
      meetingsCompleted: classEntity.meetingsCompleted,
      maxCapacity: classEntity.maxCapacity,
      currentCapacity: classEntity.currentCapacity,
      schedule: classEntity.schedule,
      startDate: classEntity.startDate,
      endDate: classEntity.endDate,
      enrollmentDeadline: classEntity.enrollmentDeadline,
      lessonsUnlocked: classEntity.lessonsUnlocked,
      createdAt: classEntity.createdAt,
      updatedAt: classEntity.updatedAt,
    };
  }
}
