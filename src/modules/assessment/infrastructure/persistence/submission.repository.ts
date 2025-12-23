import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import {
  ISubmissionRepository,
  SubmissionFilters,
  PaginatedSubmissions,
} from '@assessment/domain/repositories/submission.repository.interface';
import { Submission } from '@assessment/domain/aggregates/submission.aggregate';
import { SubmissionId } from '@assessment/domain/value-objects/submission-id.vo';
import { SubmissionMapper } from './submission.mapper';
import { Prisma } from '@prisma/client';

@Injectable()
export class SubmissionRepository implements ISubmissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: SubmissionId): Promise<Submission | null> {
    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id: id.value },
    });

    return submission ? SubmissionMapper.toDomain(submission) : null;
  }

  async findByExerciseAndStudent(
    exerciseId: string,
    studentId: string,
  ): Promise<Submission | null> {
    const submission = await this.prisma.assignmentSubmission.findFirst({
      where: { exerciseId, studentId },
      orderBy: { version: 'desc' },
    });

    return submission ? SubmissionMapper.toDomain(submission) : null;
  }

  async findLatestByExerciseAndStudent(
    exerciseId: string,
    studentId: string,
  ): Promise<Submission | null> {
    const submission = await this.prisma.assignmentSubmission.findFirst({
      where: { exerciseId, studentId },
      orderBy: { version: 'desc' },
    });

    return submission ? SubmissionMapper.toDomain(submission) : null;
  }

  async findPaginated(
    filters: SubmissionFilters,
    page: number,
    limit: number,
  ): Promise<PaginatedSubmissions> {
    const where: Prisma.AssignmentSubmissionWhereInput = {};

    if (filters.exerciseId) {
      where.exerciseId = filters.exerciseId;
    }
    if (filters.studentId) {
      where.studentId = filters.studentId;
    }
    if (filters.status) {
      where.status = filters.status as 'pending' | 'graded' | 'returned';
    }
    if (filters.gradedById) {
      where.gradedById = filters.gradedById;
    }
    if (filters.startDate || filters.endDate) {
      where.submittedAt = {};
      if (filters.startDate) {
        where.submittedAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.submittedAt.lte = filters.endDate;
      }
    }

    const [submissions, total] = await Promise.all([
      this.prisma.assignmentSubmission.findMany({
        where,
        orderBy: { submittedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.assignmentSubmission.count({ where }),
    ]);

    return {
      data: submissions.map((s) => SubmissionMapper.toDomain(s)),
      total,
      page,
      limit,
    };
  }

  async findPendingForInstructor(
    instructorId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedSubmissions> {
    // Get classes taught by instructor
    const instructorClasses = await this.prisma.class.findMany({
      where: { instructorId },
      select: { id: true, courseId: true },
    });

    const classIds = instructorClasses.map((c) => c.id);
    const courseIds = [...new Set(instructorClasses.map((c) => c.courseId))];

    // Get enrolled students
    const enrollments = await this.prisma.classEnrollment.findMany({
      where: { classId: { in: classIds }, status: 'active' },
      select: { studentId: true },
    });

    const studentIds = [...new Set(enrollments.map((e) => e.studentId))];

    // Get assignment exercises
    const exercises = await this.prisma.exercise.findMany({
      where: {
        type: 'assignment',
        lesson: { section: { courseId: { in: courseIds } } },
      },
      select: { id: true },
    });

    const exerciseIds = exercises.map((e) => e.id);

    const where: Prisma.AssignmentSubmissionWhereInput = {
      status: 'pending',
      studentId: { in: studentIds },
      exerciseId: { in: exerciseIds },
    };

    const [submissions, total] = await Promise.all([
      this.prisma.assignmentSubmission.findMany({
        where,
        orderBy: { submittedAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.assignmentSubmission.count({ where }),
    ]);

    return {
      data: submissions.map((s) => SubmissionMapper.toDomain(s)),
      total,
      page,
      limit,
    };
  }

  async save(submission: Submission): Promise<void> {
    const data = SubmissionMapper.toPersistence(submission);

    await this.prisma.assignmentSubmission.upsert({
      where: { id: data.id },
      create: {
        id: data.id,
        exerciseId: data.exerciseId,
        studentId: data.studentId,
        type: data.type as 'file' | 'text' | 'link',
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        textContent: data.textContent,
        linkUrl: data.linkUrl,
        comment: data.comment,
        version: data.version,
        status: data.status as 'pending' | 'graded' | 'returned',
        grade: data.grade,
        maxGrade: data.maxGrade,
        feedback: data.feedback,
        gradedById: data.gradedById,
        gradedAt: data.gradedAt,
      },
      update: {
        type: data.type as 'file' | 'text' | 'link',
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        textContent: data.textContent,
        linkUrl: data.linkUrl,
        comment: data.comment,
        version: data.version,
        status: data.status as 'pending' | 'graded' | 'returned',
        grade: data.grade,
        maxGrade: data.maxGrade,
        feedback: data.feedback,
        gradedById: data.gradedById,
        gradedAt: data.gradedAt,
      },
    });
  }

  async delete(id: SubmissionId): Promise<void> {
    await this.prisma.assignmentSubmission.delete({
      where: { id: id.value },
    });
  }

  async countPending(exerciseId?: string): Promise<number> {
    const where: Prisma.AssignmentSubmissionWhereInput = {
      status: 'pending',
    };

    if (exerciseId) {
      where.exerciseId = exerciseId;
    }

    return this.prisma.assignmentSubmission.count({ where });
  }
}
