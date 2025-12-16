import { Entity } from '@shared/domain/entity.base';
import { ExerciseId } from '../value-objects/exercise-id.vo';
import {
  ExerciseType,
  ExerciseTypeEnum,
} from '../value-objects/exercise-type.vo';
import { QuizType } from '../value-objects/quiz-type.vo';

// Content types for different exercise types
export interface VideoContent {
  youtubeId: string;
  duration: number; // seconds
  resumePosition?: number;
}

export interface QuizContent {
  quizType: QuizType;
  questions: QuizQuestion[];
  passingScore: number; // percentage (0-100)
  maxAttempts?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string | string[] | Record<string, string>;
  points: number;
}

export interface MaterialContent {
  body: string; // HTML or Markdown
  images?: string[];
}

export interface AssignmentContent {
  instructions: string;
  rubric?: string;
  maxScore: number;
  dueDate?: Date;
}

export interface CodingChallengeContent {
  instructions: string;
  starterCode: string;
  testCases: TestCase[];
  language: string; // 'python'
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  hidden?: boolean;
}

export interface CodingPlaygroundContent {
  instructions: string;
  starterCode: string;
  outputType: 'console' | 'turtle' | 'matplotlib';
  language: string;
}

export type ExerciseContent =
  | VideoContent
  | QuizContent
  | MaterialContent
  | AssignmentContent
  | CodingChallengeContent
  | CodingPlaygroundContent;

export interface ExerciseProps {
  lessonId: string;
  title: string;
  type: ExerciseType;
  content: ExerciseContent;
  orderIndex: number;
  estimatedDuration?: number; // minutes
}

export interface CreateExerciseProps {
  lessonId: string;
  title: string;
  type: ExerciseTypeEnum;
  content: ExerciseContent;
  orderIndex: number;
  estimatedDuration?: number;
}

export interface RestoreExerciseProps {
  id: string;
  lessonId: string;
  title: string;
  type: string;
  content: ExerciseContent;
  orderIndex: number;
  estimatedDuration?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Exercise extends Entity<ExerciseId> {
  private _lessonId: string;
  private _title: string;
  private _type: ExerciseType;
  private _content: ExerciseContent;
  private _orderIndex: number;
  private _estimatedDuration?: number;

  private constructor(
    id: ExerciseId,
    props: ExerciseProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt, updatedAt);
    this._lessonId = props.lessonId;
    this._title = props.title;
    this._type = props.type;
    this._content = props.content;
    this._orderIndex = props.orderIndex;
    this._estimatedDuration = props.estimatedDuration;
  }

  // Getters
  get lessonId(): string {
    return this._lessonId;
  }

  get title(): string {
    return this._title;
  }

  get type(): ExerciseType {
    return this._type;
  }

  get content(): ExerciseContent {
    return this._content;
  }

  get orderIndex(): number {
    return this._orderIndex;
  }

  get estimatedDuration(): number | undefined {
    return this._estimatedDuration;
  }

  // Factory Methods
  static create(props: CreateExerciseProps): Exercise {
    const id = ExerciseId.create();
    const type = ExerciseType.create(props.type);

    return new Exercise(id, {
      lessonId: props.lessonId,
      title: props.title,
      type,
      content: props.content,
      orderIndex: props.orderIndex,
      estimatedDuration: props.estimatedDuration,
    });
  }

  static restore(props: RestoreExerciseProps): Exercise {
    const id = ExerciseId.create(props.id);
    const type = ExerciseType.create(props.type);

    return new Exercise(
      id,
      {
        lessonId: props.lessonId,
        title: props.title,
        type,
        content: props.content,
        orderIndex: props.orderIndex,
        estimatedDuration: props.estimatedDuration,
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

  updateContent(content: ExerciseContent): void {
    this._content = content;
    this.touch();
  }

  updateOrder(orderIndex: number): void {
    this._orderIndex = orderIndex;
    this.touch();
  }

  updateEstimatedDuration(duration: number): void {
    this._estimatedDuration = duration;
    this.touch();
  }
}
