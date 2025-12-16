import { ValueObject } from '@shared/domain/value-object.base';

export enum CourseStatusEnum {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

interface CourseStatusProps {
  value: CourseStatusEnum;
}

export class CourseStatus extends ValueObject<CourseStatusProps> {
  private constructor(props: CourseStatusProps) {
    super(props);
  }

  get value(): CourseStatusEnum {
    return this.props.value;
  }

  static create(status: string): CourseStatus {
    const validStatuses = Object.values(CourseStatusEnum);
    if (!validStatuses.includes(status as CourseStatusEnum)) {
      throw new Error(`Invalid course status: ${status}`);
    }
    return new CourseStatus({ value: status as CourseStatusEnum });
  }

  static draft(): CourseStatus {
    return new CourseStatus({ value: CourseStatusEnum.DRAFT });
  }

  static published(): CourseStatus {
    return new CourseStatus({ value: CourseStatusEnum.PUBLISHED });
  }

  static archived(): CourseStatus {
    return new CourseStatus({ value: CourseStatusEnum.ARCHIVED });
  }

  isDraft(): boolean {
    return this.props.value === CourseStatusEnum.DRAFT;
  }

  isPublished(): boolean {
    return this.props.value === CourseStatusEnum.PUBLISHED;
  }

  isArchived(): boolean {
    return this.props.value === CourseStatusEnum.ARCHIVED;
  }

  canPublish(): boolean {
    return this.isDraft();
  }

  canArchive(): boolean {
    return this.isPublished();
  }

  canEdit(): boolean {
    return !this.isArchived();
  }
}
