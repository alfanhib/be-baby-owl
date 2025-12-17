import { AggregateRoot } from '@shared/domain/aggregate-root.base';
import { ProgressId } from '../value-objects/progress-id.vo';
import { LessonProgress } from '../entities/lesson-progress.entity';
import { ExerciseProgress } from '../entities/exercise-progress.entity';
import { ExerciseCompletedEvent } from '../events/exercise-completed.event';
import { LessonCompletedEvent } from '../events/lesson-completed.event';

export interface StudentProgressProps {
  userId: string;
  courseId: string;
  lessonProgressMap: Map<string, LessonProgress>; // lessonId -> LessonProgress
  exerciseProgressMap: Map<string, ExerciseProgress>; // exerciseId -> ExerciseProgress
}

export interface CreateStudentProgressProps {
  userId: string;
  courseId: string;
}

export interface RestoreStudentProgressProps {
  id: string;
  userId: string;
  courseId: string;
  lessonProgressList: LessonProgress[];
  exerciseProgressList: ExerciseProgress[];
  createdAt: Date;
  updatedAt: Date;
}

export class StudentProgress extends AggregateRoot<ProgressId> {
  private _userId: string;
  private _courseId: string;
  private _lessonProgressMap: Map<string, LessonProgress>;
  private _exerciseProgressMap: Map<string, ExerciseProgress>;

  private constructor(
    id: ProgressId,
    props: StudentProgressProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt, updatedAt);
    this._userId = props.userId;
    this._courseId = props.courseId;
    this._lessonProgressMap = props.lessonProgressMap;
    this._exerciseProgressMap = props.exerciseProgressMap;
  }

  // Getters
  get userId(): string {
    return this._userId;
  }

  get courseId(): string {
    return this._courseId;
  }

  get lessonProgressList(): LessonProgress[] {
    return Array.from(this._lessonProgressMap.values());
  }

  get exerciseProgressList(): ExerciseProgress[] {
    return Array.from(this._exerciseProgressMap.values());
  }

  get completedLessons(): number {
    return this.lessonProgressList.filter((lp) => lp.completed).length;
  }

  get completedExercises(): number {
    return this.exerciseProgressList.filter((ep) => ep.completed).length;
  }

  // Factory Methods
  static create(props: CreateStudentProgressProps): StudentProgress {
    const id = ProgressId.create();

    return new StudentProgress(id, {
      userId: props.userId,
      courseId: props.courseId,
      lessonProgressMap: new Map(),
      exerciseProgressMap: new Map(),
    });
  }

  static restore(props: RestoreStudentProgressProps): StudentProgress {
    const id = ProgressId.create(props.id);

    const lessonProgressMap = new Map<string, LessonProgress>();
    props.lessonProgressList.forEach((lp) => {
      lessonProgressMap.set(lp.lessonId, lp);
    });

    const exerciseProgressMap = new Map<string, ExerciseProgress>();
    props.exerciseProgressList.forEach((ep) => {
      exerciseProgressMap.set(ep.exerciseId, ep);
    });

    return new StudentProgress(
      id,
      {
        userId: props.userId,
        courseId: props.courseId,
        lessonProgressMap,
        exerciseProgressMap,
      },
      props.createdAt,
      props.updatedAt,
    );
  }

  // Business Methods
  getOrCreateLessonProgress(
    lessonId: string,
    totalExercises: number,
  ): LessonProgress {
    let lessonProgress = this._lessonProgressMap.get(lessonId);

    if (!lessonProgress) {
      lessonProgress = LessonProgress.create({
        userId: this._userId,
        lessonId,
        totalExercises,
      });
      this._lessonProgressMap.set(lessonId, lessonProgress);
      this.touch();
    }

    return lessonProgress;
  }

  getOrCreateExerciseProgress(exerciseId: string): ExerciseProgress {
    let exerciseProgress = this._exerciseProgressMap.get(exerciseId);

    if (!exerciseProgress) {
      exerciseProgress = ExerciseProgress.create({
        userId: this._userId,
        exerciseId,
      });
      this._exerciseProgressMap.set(exerciseId, exerciseProgress);
      this.touch();
    }

    return exerciseProgress;
  }

  completeExercise(
    exerciseId: string,
    lessonId: string,
    totalExercisesInLesson: number,
  ): { exerciseCompleted: boolean; lessonCompleted: boolean } {
    // Mark exercise as complete
    const exerciseProgress = this.getOrCreateExerciseProgress(exerciseId);
    const wasExerciseComplete = exerciseProgress.completed;
    exerciseProgress.markComplete();

    const result = { exerciseCompleted: false, lessonCompleted: false };

    // If exercise wasn't already complete, update lesson progress
    if (!wasExerciseComplete) {
      result.exerciseCompleted = true;

      // Publish exercise completed event
      this.addDomainEvent(
        new ExerciseCompletedEvent(this._userId, exerciseId, lessonId),
      );

      // Update lesson progress
      const lessonProgress = this.getOrCreateLessonProgress(
        lessonId,
        totalExercisesInLesson,
      );
      const lessonCompleted = lessonProgress.incrementExercisesCompleted();

      if (lessonCompleted) {
        result.lessonCompleted = true;
        // Publish lesson completed event
        this.addDomainEvent(
          new LessonCompletedEvent(this._userId, lessonId, this._courseId),
        );
      }
    }

    this.touch();
    return result;
  }

  updateVideoProgress(
    exerciseId: string,
    lessonId: string,
    watchedSeconds: number,
    totalSeconds: number,
    totalExercisesInLesson: number,
  ): { exerciseCompleted: boolean; lessonCompleted: boolean } {
    const exerciseProgress = this.getOrCreateExerciseProgress(exerciseId);
    const wasComplete = exerciseProgress.completed;
    const nowComplete = exerciseProgress.updateVideoProgress(
      watchedSeconds,
      totalSeconds,
    );

    const result = { exerciseCompleted: false, lessonCompleted: false };

    if (nowComplete && !wasComplete) {
      result.exerciseCompleted = true;

      this.addDomainEvent(
        new ExerciseCompletedEvent(this._userId, exerciseId, lessonId),
      );

      const lessonProgress = this.getOrCreateLessonProgress(
        lessonId,
        totalExercisesInLesson,
      );
      const lessonCompleted = lessonProgress.incrementExercisesCompleted();

      if (lessonCompleted) {
        result.lessonCompleted = true;
        this.addDomainEvent(
          new LessonCompletedEvent(this._userId, lessonId, this._courseId),
        );
      }
    }

    this.touch();
    return result;
  }

  updateMaterialProgress(
    exerciseId: string,
    lessonId: string,
    scrollDepth: number,
    totalExercisesInLesson: number,
  ): { exerciseCompleted: boolean; lessonCompleted: boolean } {
    const exerciseProgress = this.getOrCreateExerciseProgress(exerciseId);
    const wasComplete = exerciseProgress.completed;
    const nowComplete = exerciseProgress.updateMaterialProgress(scrollDepth);

    const result = { exerciseCompleted: false, lessonCompleted: false };

    if (nowComplete && !wasComplete) {
      result.exerciseCompleted = true;

      this.addDomainEvent(
        new ExerciseCompletedEvent(this._userId, exerciseId, lessonId),
      );

      const lessonProgress = this.getOrCreateLessonProgress(
        lessonId,
        totalExercisesInLesson,
      );
      const lessonCompleted = lessonProgress.incrementExercisesCompleted();

      if (lessonCompleted) {
        result.lessonCompleted = true;
        this.addDomainEvent(
          new LessonCompletedEvent(this._userId, lessonId, this._courseId),
        );
      }
    }

    this.touch();
    return result;
  }

  // Query methods
  getLessonProgress(lessonId: string): LessonProgress | undefined {
    return this._lessonProgressMap.get(lessonId);
  }

  getExerciseProgress(exerciseId: string): ExerciseProgress | undefined {
    return this._exerciseProgressMap.get(exerciseId);
  }

  isExerciseCompleted(exerciseId: string): boolean {
    return this._exerciseProgressMap.get(exerciseId)?.completed ?? false;
  }

  isLessonCompleted(lessonId: string): boolean {
    return this._lessonProgressMap.get(lessonId)?.completed ?? false;
  }

  calculateCourseProgress(totalLessons: number): number {
    if (totalLessons === 0) return 0;
    return Math.round((this.completedLessons / totalLessons) * 100);
  }
}
