import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { GetStudentSubmissionsQuery } from './get-student-submissions.query';
import { Prisma } from '@prisma/client';

export interface StudentSubmissionDto {
  id: string;
  exerciseId: string;
  exerciseTitle: string;
  lessonTitle: string;
  courseTitle: string;
  type: string;
  fileUrl: string | null;
  fileName: string | null;
  textContent: string | null;
  linkUrl: string | null;
  comment: string | null;
  version: number;
  status: string;
  grade: number | null;
  maxGrade: number | null;
  feedback: string | null;
  gradedAt: Date | null;
  submittedAt: Date;
}

export interface PaginatedStudentSubmissions {
  data: StudentSubmissionDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@QueryHandler(GetStudentSubmissionsQuery)
export class GetStudentSubmissionsHandler
  implements IQueryHandler<GetStudentSubmissionsQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: GetStudentSubmissionsQuery,
  ): Promise<PaginatedStudentSubmissions> {
    const { studentId, exerciseId, status, page, limit } = query;

    const where: Prisma.AssignmentSubmissionWhereInput = {
      studentId,
    };

    if (exerciseId) {
      where.exerciseId = exerciseId;
    }

    if (status) {
      where.status = status as 'pending' | 'graded' | 'returned';
    }

    const [submissions, total] = await Promise.all([
      this.prisma.assignmentSubmission.findMany({
        where,
        include: {
          exercise: {
            select: {
              id: true,
              title: true,
              lesson: {
                select: {
                  title: true,
                  section: {
                    select: {
                      course: { select: { title: true } },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.assignmentSubmission.count({ where }),
    ]);

    const data: StudentSubmissionDto[] = submissions.map((s) => ({
      id: s.id,
      exerciseId: s.exerciseId,
      exerciseTitle: s.exercise.title,
      lessonTitle: s.exercise.lesson.title,
      courseTitle: s.exercise.lesson.section.course.title,
      type: s.type,
      fileUrl: s.fileUrl,
      fileName: s.fileName,
      textContent: s.textContent,
      linkUrl: s.linkUrl,
      comment: s.comment,
      version: s.version,
      status: s.status,
      grade: s.grade,
      maxGrade: s.maxGrade,
      feedback: s.feedback,
      gradedAt: s.gradedAt,
      submittedAt: s.submittedAt,
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

