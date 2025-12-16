import { AggregateRoot } from '@shared/domain/aggregate-root.base';
import { CourseId } from '../value-objects/course-id.vo';
import { CourseStatus } from '../value-objects/course-status.vo';
import { CourseLevel, CourseLevelEnum } from '../value-objects/course-level.vo';
import { Slug } from '../value-objects/slug.vo';
import { Section, CreateSectionProps } from '../entities/section.entity';
import { CourseCreatedEvent } from '../events/course-created.event';
import { CoursePublishedEvent } from '../events/course-published.event';

export interface CourseProps {
  title: string;
  slug: Slug;
  description: string;
  coverImage?: string;
  category?: string;
  level?: CourseLevel;
  language: string;
  estimatedDuration?: number; // hours
  status: CourseStatus;
  createdById: string;
  publishedAt?: Date;
  sections: Section[];
}

export interface CreateCourseProps {
  title: string;
  slug?: string;
  description: string;
  coverImage?: string;
  category?: string;
  level?: CourseLevelEnum;
  language?: string;
  estimatedDuration?: number;
  createdById: string;
}

export interface RestoreCourseProps {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage?: string;
  category?: string;
  level?: string;
  language: string;
  estimatedDuration?: number;
  status: string;
  createdById: string;
  publishedAt?: Date;
  sections: Section[];
  createdAt: Date;
  updatedAt: Date;
}

export class Course extends AggregateRoot<CourseId> {
  private _title: string;
  private _slug: Slug;
  private _description: string;
  private _coverImage?: string;
  private _category?: string;
  private _level?: CourseLevel;
  private _language: string;
  private _estimatedDuration?: number;
  private _status: CourseStatus;
  private _createdById: string;
  private _publishedAt?: Date;
  private _sections: Section[];

  private constructor(
    id: CourseId,
    props: CourseProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt, updatedAt);
    this._title = props.title;
    this._slug = props.slug;
    this._description = props.description;
    this._coverImage = props.coverImage;
    this._category = props.category;
    this._level = props.level;
    this._language = props.language;
    this._estimatedDuration = props.estimatedDuration;
    this._status = props.status;
    this._createdById = props.createdById;
    this._publishedAt = props.publishedAt;
    this._sections = props.sections;
  }

  // ============================================
  // Getters
  // ============================================

  get title(): string {
    return this._title;
  }

  get slug(): Slug {
    return this._slug;
  }

  get description(): string {
    return this._description;
  }

  get coverImage(): string | undefined {
    return this._coverImage;
  }

  get category(): string | undefined {
    return this._category;
  }

  get level(): CourseLevel | undefined {
    return this._level;
  }

  get language(): string {
    return this._language;
  }

  get estimatedDuration(): number | undefined {
    return this._estimatedDuration;
  }

  get status(): CourseStatus {
    return this._status;
  }

  get createdById(): string {
    return this._createdById;
  }

  get publishedAt(): Date | undefined {
    return this._publishedAt;
  }

  get sections(): Section[] {
    return [...this._sections];
  }

  get sectionCount(): number {
    return this._sections.length;
  }

  get totalLessons(): number {
    return this._sections.reduce((sum, s) => sum + s.lessonCount, 0);
  }

  get totalExercises(): number {
    return this._sections.reduce((sum, s) => sum + s.totalExercises, 0);
  }

  // ============================================
  // Factory Methods
  // ============================================

  static create(props: CreateCourseProps): Course {
    const id = CourseId.create();
    const slug = props.slug
      ? Slug.create(props.slug)
      : Slug.fromTitle(props.title);
    const status = CourseStatus.draft();
    const level = props.level ? CourseLevel.create(props.level) : undefined;

    const course = new Course(id, {
      title: props.title,
      slug,
      description: props.description,
      coverImage: props.coverImage,
      category: props.category,
      level,
      language: props.language ?? 'indonesian',
      estimatedDuration: props.estimatedDuration,
      status,
      createdById: props.createdById,
      sections: [],
    });

    course.addDomainEvent(
      new CourseCreatedEvent(
        id.value,
        props.title,
        slug.value,
        props.createdById,
      ),
    );

    return course;
  }

  static restore(props: RestoreCourseProps): Course {
    const id = CourseId.create(props.id);
    const slug = Slug.create(props.slug);
    const status = CourseStatus.create(props.status);
    const level = props.level ? CourseLevel.create(props.level) : undefined;

    return new Course(
      id,
      {
        title: props.title,
        slug,
        description: props.description,
        coverImage: props.coverImage,
        category: props.category,
        level,
        language: props.language,
        estimatedDuration: props.estimatedDuration,
        status,
        createdById: props.createdById,
        publishedAt: props.publishedAt,
        sections: props.sections,
      },
      props.createdAt,
      props.updatedAt,
    );
  }

  // ============================================
  // Business Methods
  // ============================================

  updateBasicInfo(data: {
    title?: string;
    description?: string;
    coverImage?: string;
    category?: string;
    level?: CourseLevelEnum;
    language?: string;
    estimatedDuration?: number;
  }): void {
    if (!this._status.canEdit()) {
      throw new Error('Cannot edit archived course');
    }

    if (data.title !== undefined) {
      this._title = data.title;
    }
    if (data.description !== undefined) {
      this._description = data.description;
    }
    if (data.coverImage !== undefined) {
      this._coverImage = data.coverImage;
    }
    if (data.category !== undefined) {
      this._category = data.category;
    }
    if (data.level !== undefined) {
      this._level = CourseLevel.create(data.level);
    }
    if (data.language !== undefined) {
      this._language = data.language;
    }
    if (data.estimatedDuration !== undefined) {
      this._estimatedDuration = data.estimatedDuration;
    }

    this.touch();
  }

  updateSlug(slug: string): void {
    if (!this._status.canEdit()) {
      throw new Error('Cannot edit archived course');
    }
    this._slug = Slug.create(slug);
    this.touch();
  }

  publish(): void {
    if (!this._status.canPublish()) {
      throw new Error('Course can only be published from draft status');
    }

    if (this._sections.length === 0) {
      throw new Error('Cannot publish course without sections');
    }

    this._status = CourseStatus.published();
    this._publishedAt = new Date();
    this.touch();

    this.addDomainEvent(
      new CoursePublishedEvent(this.id.value, this._title, this._slug.value),
    );
  }

  archive(): void {
    if (!this._status.canArchive()) {
      throw new Error('Course can only be archived from published status');
    }

    this._status = CourseStatus.archived();
    this.touch();
  }

  unpublish(): void {
    if (!this._status.isPublished()) {
      throw new Error('Course can only be unpublished from published status');
    }

    this._status = CourseStatus.draft();
    this._publishedAt = undefined;
    this.touch();
  }

  // Section Management
  addSection(
    props: Omit<CreateSectionProps, 'courseId' | 'orderIndex'>,
  ): Section {
    if (!this._status.canEdit()) {
      throw new Error('Cannot edit archived course');
    }

    const section = Section.create({
      ...props,
      courseId: this.id.value,
      orderIndex: this._sections.length,
    });

    this._sections.push(section);
    this.touch();
    return section;
  }

  removeSection(sectionId: string): void {
    if (!this._status.canEdit()) {
      throw new Error('Cannot edit archived course');
    }

    const index = this._sections.findIndex((s) => s.id.value === sectionId);
    if (index === -1) {
      throw new Error(`Section ${sectionId} not found in course`);
    }

    this._sections.splice(index, 1);
    // Reorder remaining sections
    this._sections.forEach((s, i) => s.updateOrder(i));
    this.touch();
  }

  reorderSections(sectionIds: string[]): void {
    if (!this._status.canEdit()) {
      throw new Error('Cannot edit archived course');
    }

    const sectionMap = new Map(this._sections.map((s) => [s.id.value, s]));
    const reordered: Section[] = [];

    for (const id of sectionIds) {
      const section = sectionMap.get(id);
      if (!section) {
        throw new Error(`Section ${id} not found in course`);
      }
      section.updateOrder(reordered.length);
      reordered.push(section);
    }

    this._sections = reordered;
    this.touch();
  }

  getSectionById(sectionId: string): Section | undefined {
    return this._sections.find((s) => s.id.value === sectionId);
  }

  // Query Methods
  isPublished(): boolean {
    return this._status.isPublished();
  }

  isDraft(): boolean {
    return this._status.isDraft();
  }

  isArchived(): boolean {
    return this._status.isArchived();
  }
}
