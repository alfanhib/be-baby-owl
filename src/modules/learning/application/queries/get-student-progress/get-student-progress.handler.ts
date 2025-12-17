import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetStudentProgressQuery } from './get-student-progress.query';
import {
  IProgressRepository,
  PROGRESS_REPOSITORY,
} from '@learning/domain/repositories/progress.repository.interface';
import {
  ICourseRepository,
  COURSE_REPOSITORY,
} from '@learning/domain/repositories/course.repository.interface';
import { CourseId } from '@learning/domain/value-objects/course-id.vo';

export interface StudentProgressResult {
  courseId: string;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  totalExercises: number;
  completedExercises: number;
  progressPercentage: number;
  lessonProgress: Array<{
    lessonId: string;
    lessonTitle: string;
    completed: boolean;
    exercisesCompleted: number;
    totalExercises: number;
    progressPercentage: number;
  }>;
  exerciseProgress: Array<{
    exerciseId: string;
    exerciseTitle: string;
    type: string;
    completed: boolean;
    watchedSeconds?: number;
    scrollDepth?: number;
  }>;
}

@QueryHandler(GetStudentProgressQuery)
export class GetStudentProgressHandler implements IQueryHandler<GetStudentProgressQuery> {
  constructor(
    @Inject(PROGRESS_REPOSITORY)
    private readonly progressRepository: IProgressRepository,
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async execute(
    query: GetStudentProgressQuery,
  ): Promise<StudentProgressResult | null> {
    const { userId, courseId } = query;

    // Get course details
    const course = await this.courseRepository.findById(
      CourseId.create(courseId),
    );
    if (!course) {
      return null;
    }

    // Build lesson and exercise maps from course
    const lessonMap = new Map<
      string,
      { title: string; sectionTitle: string; exercises: string[] }
    >();
    const exerciseMap = new Map<
      string,
      { title: string; type: string; lessonId: string }
    >();

    let totalLessons = 0;
    let totalExercises = 0;

    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        totalLessons++;
        const exerciseIds: string[] = [];

        for (const exercise of lesson.exercises) {
          totalExercises++;
          exerciseIds.push(exercise.id.value);
          exerciseMap.set(exercise.id.value, {
            title: exercise.title,
            type: exercise.type.value,
            lessonId: lesson.id.value,
          });
        }

        lessonMap.set(lesson.id.value, {
          title: lesson.title,
          sectionTitle: section.title,
          exercises: exerciseIds,
        });
      }
    }

    // Get student progress
    const progress = await this.progressRepository.findByUserAndCourse(
      userId,
      courseId,
    );

    // Build result
    const lessonProgress: StudentProgressResult['lessonProgress'] = [];
    const exerciseProgress: StudentProgressResult['exerciseProgress'] = [];

    let completedLessons = 0;
    let completedExercises = 0;

    for (const [lessonId, lessonInfo] of lessonMap) {
      const lp = progress?.getLessonProgress(lessonId);
      const lessonCompleted = lp?.completed ?? false;

      if (lessonCompleted) completedLessons++;

      const exercisesCompletedInLesson = lp?.exercisesCompleted ?? 0;

      lessonProgress.push({
        lessonId,
        lessonTitle: lessonInfo.title,
        completed: lessonCompleted,
        exercisesCompleted: exercisesCompletedInLesson,
        totalExercises: lessonInfo.exercises.length,
        progressPercentage:
          lessonInfo.exercises.length > 0
            ? Math.round(
                (exercisesCompletedInLesson / lessonInfo.exercises.length) *
                  100,
              )
            : 0,
      });
    }

    for (const [exerciseId, exerciseInfo] of exerciseMap) {
      const ep = progress?.getExerciseProgress(exerciseId);
      const exerciseCompleted = ep?.completed ?? false;

      if (exerciseCompleted) completedExercises++;

      exerciseProgress.push({
        exerciseId,
        exerciseTitle: exerciseInfo.title,
        type: exerciseInfo.type,
        completed: exerciseCompleted,
        watchedSeconds: ep?.watchedSeconds,
        scrollDepth: ep?.scrollDepth,
      });
    }

    const progressPercentage =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    return {
      courseId,
      courseTitle: course.title,
      totalLessons,
      completedLessons,
      totalExercises,
      completedExercises,
      progressPercentage,
      lessonProgress,
      exerciseProgress,
    };
  }
}
