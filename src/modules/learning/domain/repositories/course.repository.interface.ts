import { Course } from '../aggregates/course.aggregate';
import { CourseId } from '../value-objects/course-id.vo';

export const COURSE_REPOSITORY = Symbol('COURSE_REPOSITORY');

export interface ICourseRepository {
  /**
   * Find course by ID (includes sections, lessons, exercises)
   */
  findById(id: CourseId): Promise<Course | null>;

  /**
   * Find course by slug
   */
  findBySlug(slug: string): Promise<Course | null>;

  /**
   * Save course (create or update)
   */
  save(course: Course): Promise<void>;

  /**
   * Check if course exists by ID
   */
  exists(id: CourseId): Promise<boolean>;

  /**
   * Check if slug is already taken
   */
  slugExists(slug: string, excludeId?: string): Promise<boolean>;

  /**
   * Delete course by ID
   */
  delete(id: CourseId): Promise<void>;

  /**
   * Find all courses with pagination and filters
   */
  findAll(params: {
    skip?: number;
    take?: number;
    status?: string;
    category?: string;
    level?: string;
    createdById?: string;
    search?: string;
  }): Promise<{ courses: Course[]; total: number }>;

  /**
   * Find published courses (for catalog)
   */
  findPublished(params: {
    skip?: number;
    take?: number;
    category?: string;
    level?: string;
    search?: string;
  }): Promise<{ courses: Course[]; total: number }>;
}
