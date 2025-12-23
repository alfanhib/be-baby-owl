import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetCourseQuery, GetCourseBySlugQuery } from './get-course.query';
import {
  ICourseRepository,
  COURSE_REPOSITORY,
} from '@learning/domain/repositories/course.repository.interface';
import { CourseId } from '@learning/domain/value-objects/course-id.vo';
import { CourseNotFoundError } from '@learning/domain/errors/course-not-found.error';
import type { Course } from '@learning/domain/aggregates/course.aggregate';
import type { ExerciseContent } from '@learning/domain/entities/exercise.entity';

// ============================================
// Response Interfaces
// ============================================

export interface ExerciseDto {
  id: string;
  lessonId: string;
  title: string;
  type: string;
  content: ExerciseContent;
  orderIndex: number;
  estimatedDuration?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LessonDto {
  id: string;
  sectionId: string;
  title: string;
  description?: string;
  orderIndex: number;
  estimatedDuration?: number;
  status: string;
  exerciseCount: number;
  exercises: ExerciseDto[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SectionDto {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  orderIndex: number;
  lessonCount: number;
  totalExercises: number;
  lessons: LessonDto[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseDetailResult {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage?: string;
  category?: string;
  level?: string;
  language: string;
  estimatedDuration?: number;
  status: string;
  createdById: string;
  publishedAt?: Date;
  sectionCount: number;
  totalLessons: number;
  totalExercises: number;
  sections: SectionDto[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Helper function to map Course to DTO
// ============================================

function mapCourseToDetailResult(course: Course): CourseDetailResult {
  const sections: SectionDto[] = course.sections.map((section) => {
    const lessons: LessonDto[] = section.lessons.map((lesson) => {
      const exercises: ExerciseDto[] = lesson.exercises.map((exercise) => ({
        id: exercise.id.value,
        lessonId: exercise.lessonId,
        title: exercise.title,
        type: exercise.type.value,
        content: exercise.content,
        orderIndex: exercise.orderIndex,
        estimatedDuration: exercise.estimatedDuration,
        createdAt: exercise.createdAt,
        updatedAt: exercise.updatedAt,
      }));

      return {
        id: lesson.id.value,
        sectionId: lesson.sectionId,
        title: lesson.title,
        description: lesson.description,
        orderIndex: lesson.orderIndex,
        estimatedDuration: lesson.estimatedDuration,
        status: lesson.status,
        exerciseCount: lesson.exerciseCount,
        exercises,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt,
      };
    });

    return {
      id: section.id.value,
      courseId: section.courseId,
      title: section.title,
      description: section.description,
      orderIndex: section.orderIndex,
      lessonCount: section.lessonCount,
      totalExercises: section.totalExercises,
      lessons,
      createdAt: section.createdAt,
      updatedAt: section.updatedAt,
    };
  });

  return {
    id: course.id.value,
    title: course.title,
    slug: course.slug.value,
    description: course.description,
    coverImage: course.coverImage,
    category: course.category,
    level: course.level?.value,
    language: course.language,
    estimatedDuration: course.estimatedDuration,
    status: course.status.value,
    createdById: course.createdById,
    publishedAt: course.publishedAt,
    sectionCount: course.sectionCount,
    totalLessons: course.totalLessons,
    totalExercises: course.totalExercises,
    sections,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  };
}

// ============================================
// Query Handlers
// ============================================

@QueryHandler(GetCourseQuery)
export class GetCourseHandler implements IQueryHandler<GetCourseQuery> {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(query: GetCourseQuery): Promise<CourseDetailResult> {
    const courseId = CourseId.create(query.courseId);
    const course = await this.courseRepository.findById(courseId);

    if (!course) {
      throw new CourseNotFoundError(query.courseId);
    }

    return mapCourseToDetailResult(course);
  }
}

@QueryHandler(GetCourseBySlugQuery)
export class GetCourseBySlugHandler implements IQueryHandler<GetCourseBySlugQuery> {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(query: GetCourseBySlugQuery): Promise<CourseDetailResult> {
    const course = await this.courseRepository.findBySlug(query.slug);

    if (!course) {
      throw new CourseNotFoundError(query.slug);
    }

    return mapCourseToDetailResult(course);
  }
}
