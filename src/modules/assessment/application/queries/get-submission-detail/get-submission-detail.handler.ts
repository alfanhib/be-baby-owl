import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { GetSubmissionDetailQuery } from './get-submission-detail.query';
import { SubmissionNotFoundError } from '@assessment/domain/errors';

export interface SubmissionDetailDto {
  id: string;
  exerciseId: string;
  exerciseTitle: string;
  exerciseContent: unknown;
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  courseTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  type: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  textContent: string | null;
  linkUrl: string | null;
  comment: string | null;
  version: number;
  status: string;
  grade: number | null;
  maxGrade: number | null;
  percentage: number | null;
  feedback: string | null;
  gradedById: string | null;
  gradedByName: string | null;
  gradedAt: Date | null;
  submittedAt: Date;
}

@QueryHandler(GetSubmissionDetailQuery)
export class GetSubmissionDetailHandler implements IQueryHandler<GetSubmissionDetailQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetSubmissionDetailQuery): Promise<SubmissionDetailDto> {
    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id: query.submissionId },
      include: {
        student: { select: { id: true, fullName: true, email: true } },
        gradedBy: { select: { id: true, fullName: true } },
        exercise: {
          select: {
            id: true,
            title: true,
            content: true,
            lesson: {
              select: {
                id: true,
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
    });

    if (!submission) {
      throw new SubmissionNotFoundError(query.submissionId);
    }

    const percentage =
      submission.grade !== null && submission.maxGrade !== null
        ? Math.round((submission.grade / submission.maxGrade) * 100)
        : null;

    return {
      id: submission.id,
      exerciseId: submission.exerciseId,
      exerciseTitle: submission.exercise.title,
      exerciseContent: submission.exercise.content,
      lessonId: submission.exercise.lesson.id,
      lessonTitle: submission.exercise.lesson.title,
      courseId: submission.exercise.lesson.section.course.id,
      courseTitle: submission.exercise.lesson.section.course.title,
      studentId: submission.studentId,
      studentName: submission.student.fullName,
      studentEmail: submission.student.email,
      type: submission.type,
      fileUrl: submission.fileUrl,
      fileName: submission.fileName,
      fileSize: submission.fileSize,
      textContent: submission.textContent,
      linkUrl: submission.linkUrl,
      comment: submission.comment,
      version: submission.version,
      status: submission.status,
      grade: submission.grade,
      maxGrade: submission.maxGrade,
      percentage,
      feedback: submission.feedback,
      gradedById: submission.gradedById,
      gradedByName: submission.gradedBy?.fullName ?? null,
      gradedAt: submission.gradedAt,
      submittedAt: submission.submittedAt,
    };
  }
}
