import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { GetPendingSubmissionsQuery } from './get-pending-submissions.query';

export interface PendingSubmissionDto {
  id: string;
  exerciseId: string;
  exerciseTitle: string;
  lessonTitle: string;
  courseTitle: string;
  classId: string;
  className: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  type: string;
  version: number;
  submittedAt: Date;
  comment: string | null;
}

export interface PaginatedPendingSubmissions {
  data: PendingSubmissionDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@QueryHandler(GetPendingSubmissionsQuery)
export class GetPendingSubmissionsHandler
  implements IQueryHandler<GetPendingSubmissionsQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: GetPendingSubmissionsQuery,
  ): Promise<PaginatedPendingSubmissions> {
    const { instructorId, page, limit } = query;

    // Get classes taught by this instructor
    const instructorClasses = await this.prisma.class.findMany({
      where: { instructorId },
      select: { id: true, name: true, courseId: true },
    });

    const classIds = instructorClasses.map((c) => c.id);

    // Get enrolled students in those classes
    const enrollments = await this.prisma.classEnrollment.findMany({
      where: { classId: { in: classIds }, status: 'active' },
      select: { studentId: true, classId: true },
    });

    const studentIds = [...new Set(enrollments.map((e) => e.studentId))];

    // Get exercises in courses of instructor's classes
    const courseIds = [...new Set(instructorClasses.map((c) => c.courseId))];
    const exercises = await this.prisma.exercise.findMany({
      where: {
        type: 'assignment',
        lesson: {
          section: {
            courseId: { in: courseIds },
          },
        },
      },
      select: { id: true },
    });

    const exerciseIds = exercises.map((e) => e.id);

    // Get pending submissions
    const [submissions, total] = await Promise.all([
      this.prisma.assignmentSubmission.findMany({
        where: {
          status: 'pending',
          studentId: { in: studentIds },
          exerciseId: { in: exerciseIds },
        },
        include: {
          student: { select: { id: true, fullName: true, email: true } },
          exercise: {
            select: {
              id: true,
              title: true,
              lesson: {
                select: {
                  title: true,
                  section: {
                    select: {
                      course: { select: { id: true, title: true } },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { submittedAt: 'asc' }, // Oldest first
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.assignmentSubmission.count({
        where: {
          status: 'pending',
          studentId: { in: studentIds },
          exerciseId: { in: exerciseIds },
        },
      }),
    ]);

    // Map to response with class info
    const data: PendingSubmissionDto[] = submissions.map((s) => {
      const enrollment = enrollments.find((e) => e.studentId === s.studentId);
      const classInfo = instructorClasses.find(
        (c) => c.id === enrollment?.classId,
      );

      return {
        id: s.id,
        exerciseId: s.exerciseId,
        exerciseTitle: s.exercise.title,
        lessonTitle: s.exercise.lesson.title,
        courseTitle: s.exercise.lesson.section.course.title,
        classId: classInfo?.id ?? '',
        className: classInfo?.name ?? '',
        studentId: s.studentId,
        studentName: s.student.fullName,
        studentEmail: s.student.email,
        type: s.type,
        version: s.version,
        submittedAt: s.submittedAt,
        comment: s.comment,
      };
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

