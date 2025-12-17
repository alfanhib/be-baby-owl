import { Entity } from '@shared/domain/entity.base';
import { ExerciseProgressId } from '../value-objects/progress-id.vo';

export interface ExerciseProgressProps {
  userId: string;
  exerciseId: string;
  completed: boolean;
  watchedSeconds: number; // for videos
  scrollDepth: number; // for materials (percentage 0-100)
  completedAt?: Date;
}

export interface CreateExerciseProgressProps {
  userId: string;
  exerciseId: string;
}

export interface RestoreExerciseProgressProps {
  id: string;
  userId: string;
  exerciseId: string;
  completed: boolean;
  watchedSeconds: number;
  scrollDepth: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class ExerciseProgress extends Entity<ExerciseProgressId> {
  private _userId: string;
  private _exerciseId: string;
  private _completed: boolean;
  private _watchedSeconds: number;
  private _scrollDepth: number;
  private _completedAt?: Date;

  private constructor(
    id: ExerciseProgressId,
    props: ExerciseProgressProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt, updatedAt);
    this._userId = props.userId;
    this._exerciseId = props.exerciseId;
    this._completed = props.completed;
    this._watchedSeconds = props.watchedSeconds;
    this._scrollDepth = props.scrollDepth;
    this._completedAt = props.completedAt;
  }

  // Getters
  get userId(): string {
    return this._userId;
  }

  get exerciseId(): string {
    return this._exerciseId;
  }

  get completed(): boolean {
    return this._completed;
  }

  get watchedSeconds(): number {
    return this._watchedSeconds;
  }

  get scrollDepth(): number {
    return this._scrollDepth;
  }

  get completedAt(): Date | undefined {
    return this._completedAt;
  }

  // Factory Methods
  static create(props: CreateExerciseProgressProps): ExerciseProgress {
    const id = ExerciseProgressId.create();

    return new ExerciseProgress(id, {
      userId: props.userId,
      exerciseId: props.exerciseId,
      completed: false,
      watchedSeconds: 0,
      scrollDepth: 0,
    });
  }

  static restore(props: RestoreExerciseProgressProps): ExerciseProgress {
    const id = ExerciseProgressId.create(props.id);

    return new ExerciseProgress(
      id,
      {
        userId: props.userId,
        exerciseId: props.exerciseId,
        completed: props.completed,
        watchedSeconds: props.watchedSeconds,
        scrollDepth: props.scrollDepth,
        completedAt: props.completedAt,
      },
      props.createdAt,
      props.updatedAt,
    );
  }

  // Business Methods
  markComplete(): void {
    if (!this._completed) {
      this._completed = true;
      this._completedAt = new Date();
      this.touch();
    }
  }

  updateVideoProgress(watchedSeconds: number, totalSeconds: number): boolean {
    this._watchedSeconds = watchedSeconds;
    this.touch();

    // Auto-complete if watched >= 80%
    if (watchedSeconds >= totalSeconds * 0.8 && !this._completed) {
      this.markComplete();
      return true; // Completed
    }
    return false;
  }

  updateMaterialProgress(scrollDepth: number): boolean {
    this._scrollDepth = Math.min(100, Math.max(0, scrollDepth));
    this.touch();

    // Auto-complete if scrolled to 100%
    if (this._scrollDepth >= 100 && !this._completed) {
      this.markComplete();
      return true; // Completed
    }
    return false;
  }
}
