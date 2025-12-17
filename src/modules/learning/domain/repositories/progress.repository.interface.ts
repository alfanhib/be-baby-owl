import { StudentProgress } from '../aggregates/student-progress.aggregate';

export const PROGRESS_REPOSITORY = Symbol('PROGRESS_REPOSITORY');

export interface IProgressRepository {
  /**
   * Find student progress for a specific course
   */
  findByUserAndCourse(
    userId: string,
    courseId: string,
  ): Promise<StudentProgress | null>;

  /**
   * Save student progress (create or update)
   */
  save(progress: StudentProgress): Promise<void>;

  /**
   * Find all progress for a user (all courses)
   */
  findByUser(userId: string): Promise<StudentProgress[]>;

  /**
   * Find all progress for a course (all students)
   * Useful for instructor views
   */
  findByCourse(courseId: string): Promise<StudentProgress[]>;

  /**
   * Delete progress for a user in a course
   */
  delete(userId: string, courseId: string): Promise<void>;

  /**
   * Check if user has started a course
   */
  hasStartedCourse(userId: string, courseId: string): Promise<boolean>;

  /**
   * Get course completion statistics
   */
  getCourseStats(courseId: string): Promise<{
    totalStudents: number;
    completedStudents: number;
    averageProgress: number;
  }>;
}
