import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  GetClassesQuery,
  GetInstructorClassesQuery,
  GetStudentClassesQuery,
} from './get-classes.query';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

export interface ClassListItem {
  id: string;
  name: string;
  courseTitle: string;
  instructorName: string;
  type: string;
  status: string;
  price: number | null;
  totalMeetings: number;
  meetingsCompleted: number;
  currentCapacity: number;
  maxCapacity: number;
  startDate: Date | null;
  endDate: Date | null;
}

export interface ClassListResult {
  items: ClassListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@QueryHandler(GetClassesQuery)
export class GetClassesHandler implements IQueryHandler<GetClassesQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetClassesQuery): Promise<ClassListResult> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.courseId) {
      where.courseId = query.courseId;
    }
    if (query.instructorId) {
      where.instructorId = query.instructorId;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.type) {
      where.type = query.type;
    }

    const [classes, total] = await Promise.all([
      this.prisma.class.findMany({
        where,
        include: {
          course: { select: { title: true } },
          instructor: { select: { fullName: true } },
          enrollments: { where: { status: 'active' } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.class.count({ where }),
    ]);

    const items: ClassListItem[] = classes.map((c) => ({
      id: c.id,
      name: c.name,
      courseTitle: c.course.title,
      instructorName: c.instructor.fullName,
      type: c.type,
      status: c.status,
      price: c.price ? Number(c.price) : null,
      totalMeetings: c.totalMeetings,
      meetingsCompleted: c.meetingsCompleted,
      currentCapacity: c.currentCapacity,
      maxCapacity: c.maxCapacity,
      startDate: c.startDate,
      endDate: c.endDate,
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

@QueryHandler(GetInstructorClassesQuery)
export class GetInstructorClassesHandler implements IQueryHandler<GetInstructorClassesQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetInstructorClassesQuery): Promise<ClassListItem[]> {
    const where: Record<string, unknown> = {
      instructorId: query.instructorId,
    };

    if (query.status) {
      where.status = query.status;
    }

    const classes = await this.prisma.class.findMany({
      where,
      include: {
        course: { select: { title: true } },
        instructor: { select: { fullName: true } },
        enrollments: { where: { status: 'active' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return classes.map((c) => ({
      id: c.id,
      name: c.name,
      courseTitle: c.course.title,
      instructorName: c.instructor.fullName,
      type: c.type,
      status: c.status,
      price: c.price ? Number(c.price) : null,
      totalMeetings: c.totalMeetings,
      meetingsCompleted: c.meetingsCompleted,
      currentCapacity: c.currentCapacity,
      maxCapacity: c.maxCapacity,
      startDate: c.startDate,
      endDate: c.endDate,
    }));
  }
}

@QueryHandler(GetStudentClassesQuery)
export class GetStudentClassesHandler implements IQueryHandler<GetStudentClassesQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetStudentClassesQuery): Promise<ClassListItem[]> {
    // Get student enrollments and their class IDs
    const where: Record<string, unknown> = {
      studentId: query.studentId,
    };
    if (query.status) {
      where.status = query.status;
    } else {
      where.status = 'active';
    }

    const enrollments = await this.prisma.classEnrollment.findMany({
      where,
      select: { classId: true },
    });

    const classIds = enrollments.map((e) => e.classId);

    // Get classes with their details
    const classes = await this.prisma.class.findMany({
      where: { id: { in: classIds } },
      include: {
        course: { select: { title: true } },
        instructor: { select: { fullName: true } },
        enrollments: { where: { status: 'active' } },
      },
    });

    return classes.map((c) => ({
      id: c.id,
      name: c.name,
      courseTitle: c.course.title,
      instructorName: c.instructor.fullName,
      type: c.type,
      status: c.status,
      price: c.price ? Number(c.price) : null,
      totalMeetings: c.totalMeetings,
      meetingsCompleted: c.meetingsCompleted,
      currentCapacity: c.currentCapacity,
      maxCapacity: c.maxCapacity,
      startDate: c.startDate,
      endDate: c.endDate,
    }));
  }
}
