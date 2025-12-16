import { Entity } from '@shared/domain/entity.base';
import { SectionId } from '../value-objects/section-id.vo';
import { Lesson, CreateLessonProps } from './lesson.entity';

export interface SectionProps {
  courseId: string;
  title: string;
  description?: string;
  orderIndex: number;
  lessons: Lesson[];
}

export interface CreateSectionProps {
  courseId: string;
  title: string;
  description?: string;
  orderIndex: number;
}

export interface RestoreSectionProps {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  orderIndex: number;
  lessons: Lesson[];
  createdAt: Date;
  updatedAt: Date;
}

export class Section extends Entity<SectionId> {
  private _courseId: string;
  private _title: string;
  private _description?: string;
  private _orderIndex: number;
  private _lessons: Lesson[];

  private constructor(
    id: SectionId,
    props: SectionProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt, updatedAt);
    this._courseId = props.courseId;
    this._title = props.title;
    this._description = props.description;
    this._orderIndex = props.orderIndex;
    this._lessons = props.lessons;
  }

  // Getters
  get courseId(): string {
    return this._courseId;
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

  get lessons(): Lesson[] {
    return [...this._lessons];
  }

  get lessonCount(): number {
    return this._lessons.length;
  }

  get totalExercises(): number {
    return this._lessons.reduce((sum, l) => sum + l.exerciseCount, 0);
  }

  // Factory Methods
  static create(props: CreateSectionProps): Section {
    const id = SectionId.create();

    return new Section(id, {
      courseId: props.courseId,
      title: props.title,
      description: props.description,
      orderIndex: props.orderIndex,
      lessons: [],
    });
  }

  static restore(props: RestoreSectionProps): Section {
    const id = SectionId.create(props.id);

    return new Section(
      id,
      {
        courseId: props.courseId,
        title: props.title,
        description: props.description,
        orderIndex: props.orderIndex,
        lessons: props.lessons,
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

  addLesson(
    props: Omit<CreateLessonProps, 'sectionId' | 'orderIndex'>,
  ): Lesson {
    const lesson = Lesson.create({
      ...props,
      sectionId: this.id.value,
      orderIndex: this._lessons.length,
    });
    this._lessons.push(lesson);
    this.touch();
    return lesson;
  }

  removeLesson(lessonId: string): void {
    const index = this._lessons.findIndex((l) => l.id.value === lessonId);
    if (index === -1) {
      throw new Error(`Lesson ${lessonId} not found in section`);
    }
    this._lessons.splice(index, 1);
    // Reorder remaining lessons
    this._lessons.forEach((l, i) => l.updateOrder(i));
    this.touch();
  }

  reorderLessons(lessonIds: string[]): void {
    const lessonMap = new Map(this._lessons.map((l) => [l.id.value, l]));
    const reordered: Lesson[] = [];

    for (const id of lessonIds) {
      const lesson = lessonMap.get(id);
      if (!lesson) {
        throw new Error(`Lesson ${id} not found in section`);
      }
      lesson.updateOrder(reordered.length);
      reordered.push(lesson);
    }

    this._lessons = reordered;
    this.touch();
  }

  getLessonById(lessonId: string): Lesson | undefined {
    return this._lessons.find((l) => l.id.value === lessonId);
  }
}
