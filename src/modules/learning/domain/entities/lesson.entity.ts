import { Entity } from '@shared/domain/entity.base';
import { LessonId } from '../value-objects/lesson-id.vo';
import { Exercise, CreateExerciseProps } from './exercise.entity';

export interface LessonProps {
  sectionId: string;
  title: string;
  description?: string;
  orderIndex: number;
  estimatedDuration?: number; // minutes
  status: string;
  exercises: Exercise[];
}

export interface CreateLessonProps {
  sectionId: string;
  title: string;
  description?: string;
  orderIndex: number;
  estimatedDuration?: number;
}

export interface RestoreLessonProps {
  id: string;
  sectionId: string;
  title: string;
  description?: string;
  orderIndex: number;
  estimatedDuration?: number;
  status: string;
  exercises: Exercise[];
  createdAt: Date;
  updatedAt: Date;
}

export class Lesson extends Entity<LessonId> {
  private _sectionId: string;
  private _title: string;
  private _description?: string;
  private _orderIndex: number;
  private _estimatedDuration?: number;
  private _status: string;
  private _exercises: Exercise[];

  private constructor(
    id: LessonId,
    props: LessonProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt, updatedAt);
    this._sectionId = props.sectionId;
    this._title = props.title;
    this._description = props.description;
    this._orderIndex = props.orderIndex;
    this._estimatedDuration = props.estimatedDuration;
    this._status = props.status;
    this._exercises = props.exercises;
  }

  // Getters
  get sectionId(): string {
    return this._sectionId;
  }

  get title(): string {
    return this._title;
  }

  get description(): string | undefined {
    return this._description;
  }

  get orderIndex(): number {
    return this._orderIndex;
  }

  get estimatedDuration(): number | undefined {
    return this._estimatedDuration;
  }

  get status(): string {
    return this._status;
  }

  get exercises(): Exercise[] {
    return [...this._exercises];
  }

  get exerciseCount(): number {
    return this._exercises.length;
  }

  // Factory Methods
  static create(props: CreateLessonProps): Lesson {
    const id = LessonId.create();

    return new Lesson(id, {
      sectionId: props.sectionId,
      title: props.title,
      description: props.description,
      orderIndex: props.orderIndex,
      estimatedDuration: props.estimatedDuration,
      status: 'draft',
      exercises: [],
    });
  }

  static restore(props: RestoreLessonProps): Lesson {
    const id = LessonId.create(props.id);

    return new Lesson(
      id,
      {
        sectionId: props.sectionId,
        title: props.title,
        description: props.description,
        orderIndex: props.orderIndex,
        estimatedDuration: props.estimatedDuration,
        status: props.status,
        exercises: props.exercises,
      },
      props.createdAt,
      props.updatedAt,
    );
  }

  // Business Methods
  updateTitle(title: string): void {
    this._title = title;
    this.touch();
  }

  updateDescription(description: string): void {
    this._description = description;
    this.touch();
  }

  updateOrder(orderIndex: number): void {
    this._orderIndex = orderIndex;
    this.touch();
  }

  addExercise(
    props: Omit<CreateExerciseProps, 'lessonId' | 'orderIndex'>,
  ): Exercise {
    const exercise = Exercise.create({
      ...props,
      lessonId: this.id.value,
      orderIndex: this._exercises.length,
    });
    this._exercises.push(exercise);
    this.touch();
    return exercise;
  }

  removeExercise(exerciseId: string): void {
    const index = this._exercises.findIndex((e) => e.id.value === exerciseId);
    if (index === -1) {
      throw new Error(`Exercise ${exerciseId} not found in lesson`);
    }
    this._exercises.splice(index, 1);
    // Reorder remaining exercises
    this._exercises.forEach((e, i) => e.updateOrder(i));
    this.touch();
  }

  reorderExercises(exerciseIds: string[]): void {
    const exerciseMap = new Map(this._exercises.map((e) => [e.id.value, e]));
    const reordered: Exercise[] = [];

    for (const id of exerciseIds) {
      const exercise = exerciseMap.get(id);
      if (!exercise) {
        throw new Error(`Exercise ${id} not found in lesson`);
      }
      exercise.updateOrder(reordered.length);
      reordered.push(exercise);
    }

    this._exercises = reordered;
    this.touch();
  }

  getExerciseById(exerciseId: string): Exercise | undefined {
    return this._exercises.find((e) => e.id.value === exerciseId);
  }
}
