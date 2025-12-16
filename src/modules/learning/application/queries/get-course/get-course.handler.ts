import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetCourseQuery, GetCourseBySlugQuery } from './get-course.query';
import {
  ICourseRepository,
  COURSE_REPOSITORY,
} from '@learning/domain/repositories/course.repository.interface';
import { CourseId } from '@learning/domain/value-objects/course-id.vo';
import { CourseNotFoundError } from '@learning/domain/errors/course-not-found.error';

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
  createdAt: Date;
  updatedAt: Date;
}

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
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
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
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
  }
}
