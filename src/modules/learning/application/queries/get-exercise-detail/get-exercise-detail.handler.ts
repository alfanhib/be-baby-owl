import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetExerciseDetailQuery } from './get-exercise-detail.query';
import {
  ICourseRepository,
  COURSE_REPOSITORY,
} from '@learning/domain/repositories/course.repository.interface';
import {
  IProgressRepository,
  PROGRESS_REPOSITORY,
} from '@learning/domain/repositories/progress.repository.interface';
import { CourseId } from '@learning/domain/value-objects/course-id.vo';
import { Exercise } from '@learning/domain/entities/exercise.entity';
import { Lesson } from '@learning/domain/entities/lesson.entity';
import { Section } from '@learning/domain/entities/section.entity';

export interface ExerciseDetailResult {
  id: string;
  title: string;
  type: string;
  order: number;
  content: Record<string, unknown>;
  lessonId: string;
  lessonTitle: string;
  sectionId: string;
  sectionTitle: string;
  progress?: {
    completed: boolean;
    watchedSeconds?: number;
    scrollDepth?: number;
    completedAt?: Date;
  };
}

@QueryHandler(GetExerciseDetailQuery)
export class GetExerciseDetailHandler implements IQueryHandler<GetExerciseDetailQuery> {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
    @Inject(PROGRESS_REPOSITORY)
    private readonly progressRepository: IProgressRepository,
  ) {}

  async execute(
    query: GetExerciseDetailQuery,
  ): Promise<ExerciseDetailResult | null> {
    const { courseId, exerciseId, userId } = query;

    // Get course
    const course = await this.courseRepository.findById(
      CourseId.create(courseId),
    );
    if (!course) {
      return null;
    }

    // Find exercise
    let targetExercise: Exercise | undefined = undefined;
    let targetLesson: Lesson | undefined = undefined;
    let targetSection: Section | undefined = undefined;

    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        const exercise = lesson.getExerciseById(exerciseId);
        if (exercise) {
          targetExercise = exercise;
          targetLesson = lesson;
          targetSection = section;
          break;
        }
      }
      if (targetExercise) break;
    }

    if (!targetExercise || !targetLesson || !targetSection) {
      return null;
    }

    // Get progress if userId provided
    let exerciseProgress:
      | {
          completed: boolean;
          watchedSeconds?: number;
          scrollDepth?: number;
          completedAt?: Date;
        }
      | undefined = undefined;

    if (userId) {
      const progress = await this.progressRepository.findByUserAndCourse(
        userId,
        courseId,
      );
      const ep = progress?.getExerciseProgress(exerciseId);
      if (ep) {
        exerciseProgress = {
          completed: ep.completed,
          watchedSeconds: ep.watchedSeconds,
          scrollDepth: ep.scrollDepth,
          completedAt: ep.completedAt,
        };
      }
    }

    return {
      id: targetExercise.id.value,
      title: targetExercise.title,
      type: targetExercise.type.value,
      order: targetExercise.orderIndex,
      content: targetExercise.content as unknown as Record<string, unknown>,
      lessonId: targetLesson.id.value,
      lessonTitle: targetLesson.title,
      sectionId: targetSection.id.value,
      sectionTitle: targetSection.title,
      progress: exerciseProgress,
    };
  }
}
