import { Submission } from '../aggregates/submission.aggregate';
import { SubmissionId } from '../value-objects/submission-id.vo';

export const SUBMISSION_REPOSITORY = Symbol('ISubmissionRepository');

export interface SubmissionFilters {
  exerciseId?: string;
  studentId?: string;
  status?: string;
  gradedById?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface PaginatedSubmissions {
  data: Submission[];
  total: number;
  page: number;
  limit: number;
}

export interface ISubmissionRepository {
  findById(id: SubmissionId): Promise<Submission | null>;
  findByExerciseAndStudent(
    exerciseId: string,
    studentId: string,
  ): Promise<Submission | null>;
  findLatestByExerciseAndStudent(
    exerciseId: string,
    studentId: string,
  ): Promise<Submission | null>;
  findPaginated(
    filters: SubmissionFilters,
    page: number,
    limit: number,
  ): Promise<PaginatedSubmissions>;
  findPendingForInstructor(
    instructorId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedSubmissions>;
  save(submission: Submission): Promise<void>;
  delete(id: SubmissionId): Promise<void>;
  countPending(exerciseId?: string): Promise<number>;
}
