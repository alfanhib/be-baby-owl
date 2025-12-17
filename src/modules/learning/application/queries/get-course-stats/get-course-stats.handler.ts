import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetCourseStatsQuery } from './get-course-stats.query';
import {
  IProgressRepository,
  PROGRESS_REPOSITORY,
} from '@learning/domain/repositories/progress.repository.interface';
import {
  ICourseRepository,
  COURSE_REPOSITORY,
} from '@learning/domain/repositories/course.repository.interface';
import { CourseId } from '@learning/domain/value-objects/course-id.vo';

export interface CourseStatsResult {
  courseId: string;
  courseTitle: string;
  totalStudents: number;
  completedStudents: number;
  averageProgress: number;
  totalLessons: number;
  totalExercises: number;
  completionRate: number;
}

@QueryHandler(GetCourseStatsQuery)
export class GetCourseStatsHandler implements IQueryHandler<GetCourseStatsQuery> {
  constructor(
    @Inject(PROGRESS_REPOSITORY)
    private readonly progressRepository: IProgressRepository,
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(query: GetCourseStatsQuery): Promise<CourseStatsResult | null> {
    const { courseId } = query;

    // Get course details
    const course = await this.courseRepository.findById(
      CourseId.create(courseId),
    );
    if (!course) {
      return null;
    }

    // Count lessons and exercises
    let totalLessons = 0;
    let totalExercises = 0;

    for (const section of course.sections) {
      totalLessons += section.lessons.length;
      for (const lesson of section.lessons) {
        totalExercises += lesson.exercises.length;
      }
    }

    // Get course stats from repository
    const stats = await this.progressRepository.getCourseStats(courseId);

    const completionRate =
      stats.totalStudents > 0
        ? Math.round((stats.completedStudents / stats.totalStudents) * 100)
        : 0;

    return {
      courseId,
      courseTitle: course.title,
      totalStudents: stats.totalStudents,
      completedStudents: stats.completedStudents,
      averageProgress: stats.averageProgress,
      totalLessons,
      totalExercises,
      completionRate,
    };
  }
}
