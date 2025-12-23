import { AssignmentSubmission as PrismaSubmission } from '@prisma/client';
import { Submission } from '@assessment/domain/aggregates/submission.aggregate';

export class SubmissionMapper {
  static toDomain(raw: PrismaSubmission): Submission {
    return Submission.restore(raw.id, {
      exerciseId: raw.exerciseId,
      studentId: raw.studentId,
      type: raw.type,
      fileUrl: raw.fileUrl,
      fileName: raw.fileName,
      fileSize: raw.fileSize,
      textContent: raw.textContent,
      linkUrl: raw.linkUrl,
      comment: raw.comment,
      version: raw.version,
      status: raw.status,
      grade: raw.grade,
      maxGrade: raw.maxGrade,
      feedback: raw.feedback,
      gradedById: raw.gradedById,
      gradedAt: raw.gradedAt,
      createdAt: raw.submittedAt,
      updatedAt: raw.submittedAt,
    });
  }

  static toPersistence(
    submission: Submission,
  ): Omit<PrismaSubmission, 'submittedAt'> & { submittedAt?: Date } {
    return {
      id: submission.id.value,
      exerciseId: submission.exerciseId,
      studentId: submission.studentId,
      type: submission.type.value,
      fileUrl: submission.fileInfo?.url ?? null,
      fileName: submission.fileInfo?.name ?? null,
      fileSize: submission.fileInfo?.size ?? null,
      textContent: submission.textContent,
      linkUrl: submission.linkUrl,
      comment: submission.comment,
      version: submission.submissionVersion,
      status: submission.status.value,
      grade: submission.grade?.score ?? null,
      maxGrade: submission.grade?.maxScore ?? null,
      feedback: submission.feedback,
      gradedById: submission.gradedById,
      gradedAt: submission.gradedAt,
      submittedAt: submission.createdAt,
    };
  }
}
