import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetLessonDetailQuery } from './get-lesson-detail.query';
import {
  ICourseRepository,
  COURSE_REPOSITORY,
} from '@learning/domain/repositories/course.repository.interface';
import {
  IProgressRepository,
  PROGRESS_REPOSITORY,
} from '@learning/domain/repositories/progress.repository.interface';
import { CourseId } from '@learning/domain/value-objects/course-id.vo';
import { Lesson } from '@learning/domain/entities/lesson.entity';
import { Section } from '@learning/domain/entities/section.entity';

export interface LessonDetailResult {
  id: string;
  title: string;
  description: string;
  order: number;
  sectionId: string;
  sectionTitle: string;
  exercises: Array<{
    id: string;
    title: string;
    type: string;
    order: number;
    completed?: boolean;
    watchedSeconds?: number;
    scrollDepth?: number;
  }>;
  progress?: {
    completed: boolean;
    exercisesCompleted: number;
    totalExercises: number;
    progressPercentage: number;
  };
}

@QueryHandler(GetLessonDetailQuery)
export class GetLessonDetailHandler implements IQueryHandler<GetLessonDetailQuery> {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
    @Inject(PROGRESS_REPOSITORY)
    private readonly progressRepository: IProgressRepository,
  ) {}

  async execute(
    query: GetLessonDetailQuery,
  ): Promise<LessonDetailResult | null> {
    const { courseId, lessonId, userId } = query;

    // Get course
    const course = await this.courseRepository.findById(
      CourseId.create(courseId),
    );
    if (!course) {
      return null;
    }

    // Find lesson
    let targetLesson: Lesson | undefined = undefined;
    let targetSection: Section | undefined = undefined;

    for (const section of course.sections) {
      const lesson = section.getLessonById(lessonId);
      if (lesson) {
        targetLesson = lesson;
        targetSection = section;
        break;
      }
    }

    if (!targetLesson || !targetSection) {
      return null;
    }

    // Get progress if userId provided
    const progress = userId
      ? await this.progressRepository.findByUserAndCourse(userId, courseId)
      : null;

    // Build exercises with progress
    const exercises = targetLesson.exercises.map((exercise) => {
      const ep = progress?.getExerciseProgress(exercise.id.value);
      return {
        id: exercise.id.value,
        title: exercise.title,
        type: exercise.type.value,
        order: exercise.orderIndex,
        completed: ep?.completed,
        watchedSeconds: ep?.watchedSeconds,
        scrollDepth: ep?.scrollDepth,
      };
    });

    // Build lesson progress
    const lp = progress?.getLessonProgress(lessonId);
    const lessonProgress = lp
      ? {
          completed: lp.completed,
          exercisesCompleted: lp.exercisesCompleted,
          totalExercises: lp.totalExercises,
          progressPercentage: lp.progressPercentage,
        }
      : undefined;

    return {
      id: targetLesson.id.value,
      title: targetLesson.title,
      description: targetLesson.description ?? '',
      order: targetLesson.orderIndex,
      sectionId: targetSection.id.value,
      sectionTitle: targetSection.title,
      exercises,
      progress: lessonProgress,
    };
  }
}
