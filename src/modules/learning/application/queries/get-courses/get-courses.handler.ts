import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetCoursesQuery, GetPublishedCoursesQuery } from './get-courses.query';
import {
  ICourseRepository,
  COURSE_REPOSITORY,
} from '@learning/domain/repositories/course.repository.interface';

export interface CourseListItem {
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
  sectionCount: number;
  totalLessons: number;
  createdAt: Date;
}

export interface PaginatedCoursesResult {
  data: CourseListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@QueryHandler(GetCoursesQuery)
export class GetCoursesHandler implements IQueryHandler<GetCoursesQuery> {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(query: GetCoursesQuery): Promise<PaginatedCoursesResult> {
    const skip = (query.page - 1) * query.limit;

    const { courses, total } = await this.courseRepository.findAll({
      skip,
      take: query.limit,
      status: query.status,
      category: query.category,
      level: query.level,
      createdById: query.createdById,
      search: query.search,
    });

    return {
      data: courses.map((course) => ({
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
        sectionCount: course.sectionCount,
        totalLessons: course.totalLessons,
        createdAt: course.createdAt,
      })),
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }
}

@QueryHandler(GetPublishedCoursesQuery)
export class GetPublishedCoursesHandler implements IQueryHandler<GetPublishedCoursesQuery> {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(
    query: GetPublishedCoursesQuery,
  ): Promise<PaginatedCoursesResult> {
    const skip = (query.page - 1) * query.limit;

    const { courses, total } = await this.courseRepository.findPublished({
      skip,
      take: query.limit,
      category: query.category,
      level: query.level,
      search: query.search,
    });

    return {
      data: courses.map((course) => ({
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
        sectionCount: course.sectionCount,
        totalLessons: course.totalLessons,
        createdAt: course.createdAt,
      })),
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }
}
