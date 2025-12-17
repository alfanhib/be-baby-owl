import {
  LessonProgress as PrismaLessonProgress,
  ExerciseProgress as PrismaExerciseProgress,
} from '@prisma/client';
import { StudentProgress } from '@learning/domain/aggregates/student-progress.aggregate';
import { LessonProgress } from '@learning/domain/entities/lesson-progress.entity';
import { ExerciseProgress } from '@learning/domain/entities/exercise-progress.entity';

export class ProgressMapper {
  static lessonProgressToDomain(
    prismaProgress: PrismaLessonProgress,
  ): LessonProgress {
    return LessonProgress.restore({
      id: prismaProgress.id,
      userId: prismaProgress.userId,
      lessonId: prismaProgress.lessonId,
      completed: prismaProgress.completed,
      exercisesCompleted: prismaProgress.exercisesCompleted,
      totalExercises: prismaProgress.totalExercises,
      completedAt: prismaProgress.completedAt ?? undefined,
      createdAt: prismaProgress.createdAt,
      updatedAt: prismaProgress.updatedAt,
    });
  }

  static exerciseProgressToDomain(
    prismaProgress: PrismaExerciseProgress,
  ): ExerciseProgress {
    return ExerciseProgress.restore({
      id: prismaProgress.id,
      userId: prismaProgress.userId,
      exerciseId: prismaProgress.exerciseId,
      completed: prismaProgress.completed,
      watchedSeconds: prismaProgress.watchedSeconds,
      scrollDepth: prismaProgress.scrollDepth,
      completedAt: prismaProgress.completedAt ?? undefined,
      createdAt: prismaProgress.createdAt,
      updatedAt: prismaProgress.updatedAt,
    });
  }

  static toDomain(
    progressId: string,
    userId: string,
    courseId: string,
    lessonProgressList: PrismaLessonProgress[],
    exerciseProgressList: PrismaExerciseProgress[],
  ): StudentProgress {
    return StudentProgress.restore({
      id: progressId,
      userId,
      courseId,
      lessonProgressList: lessonProgressList.map((lp) =>
        this.lessonProgressToDomain(lp),
      ),
      exerciseProgressList: exerciseProgressList.map((ep) =>
        this.exerciseProgressToDomain(ep),
      ),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static lessonProgressToPersistence(progress: LessonProgress): {
    id: string;
    userId: string;
    lessonId: string;
    completed: boolean;
    exercisesCompleted: number;
    totalExercises: number;
    completedAt: Date | null;
  } {
    return {
      id: progress.id.value,
      userId: progress.userId,
      lessonId: progress.lessonId,
      completed: progress.completed,
      exercisesCompleted: progress.exercisesCompleted,
      totalExercises: progress.totalExercises,
      completedAt: progress.completedAt ?? null,
    };
  }

  static exerciseProgressToPersistence(progress: ExerciseProgress): {
    id: string;
    userId: string;
    exerciseId: string;
    completed: boolean;
    watchedSeconds: number;
    scrollDepth: number;
    completedAt: Date | null;
  } {
    return {
      id: progress.id.value,
      userId: progress.userId,
      exerciseId: progress.exerciseId,
      completed: progress.completed,
      watchedSeconds: progress.watchedSeconds,
      scrollDepth: progress.scrollDepth,
      completedAt: progress.completedAt ?? null,
    };
  }
}
