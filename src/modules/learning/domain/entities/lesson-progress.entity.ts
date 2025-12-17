import { Entity } from '@shared/domain/entity.base';
import { LessonProgressId } from '../value-objects/progress-id.vo';

export interface LessonProgressProps {
  userId: string;
  lessonId: string;
  completed: boolean;
  exercisesCompleted: number;
  totalExercises: number;
  completedAt?: Date;
}

export interface CreateLessonProgressProps {
  userId: string;
  lessonId: string;
  totalExercises: number;
}

export interface RestoreLessonProgressProps {
  id: string;
  userId: string;
  lessonId: string;
  completed: boolean;
  exercisesCompleted: number;
  totalExercises: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class LessonProgress extends Entity<LessonProgressId> {
  private _userId: string;
  private _lessonId: string;
  private _completed: boolean;
  private _exercisesCompleted: number;
  private _totalExercises: number;
  private _completedAt?: Date;

  private constructor(
    id: LessonProgressId,
    props: LessonProgressProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt, updatedAt);
    this._userId = props.userId;
    this._lessonId = props.lessonId;
    this._completed = props.completed;
    this._exercisesCompleted = props.exercisesCompleted;
    this._totalExercises = props.totalExercises;
    this._completedAt = props.completedAt;
  }

  // Getters
  get userId(): string {
    return this._userId;
  }

  get lessonId(): string {
    return this._lessonId;
  }

  get completed(): boolean {
    return this._completed;
  }

  get exercisesCompleted(): number {
    return this._exercisesCompleted;
  }

  get totalExercises(): number {
    return this._totalExercises;
  }

  get completedAt(): Date | undefined {
    return this._completedAt;
  }

  get progressPercentage(): number {
    if (this._totalExercises === 0) return 0;
    return Math.round((this._exercisesCompleted / this._totalExercises) * 100);
  }

  // Factory Methods
  static create(props: CreateLessonProgressProps): LessonProgress {
    const id = LessonProgressId.create();

    return new LessonProgress(id, {
      userId: props.userId,
      lessonId: props.lessonId,
      completed: false,
      exercisesCompleted: 0,
      totalExercises: props.totalExercises,
    });
  }

  static restore(props: RestoreLessonProgressProps): LessonProgress {
    const id = LessonProgressId.create(props.id);

    return new LessonProgress(
      id,
      {
        userId: props.userId,
        lessonId: props.lessonId,
        completed: props.completed,
        exercisesCompleted: props.exercisesCompleted,
        totalExercises: props.totalExercises,
        completedAt: props.completedAt,
      },
      props.createdAt,
      props.updatedAt,
    );
  }

  // Business Methods
  incrementExercisesCompleted(): boolean {
    this._exercisesCompleted += 1;
    this.touch();

    // Check if lesson is complete
    if (this._exercisesCompleted >= this._totalExercises && !this._completed) {
      this._completed = true;
      this._completedAt = new Date();
      return true; // Lesson completed
    }
    return false;
  }

  updateTotalExercises(total: number): void {
    this._totalExercises = total;
    // Recheck completion status
    if (this._exercisesCompleted >= total && !this._completed) {
      this._completed = true;
      this._completedAt = new Date();
    }
    this.touch();
  }
}
