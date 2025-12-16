import { DomainEvent } from '@shared/domain/domain-event.base';

export class CourseCreatedEvent extends DomainEvent {
  constructor(
    public readonly courseId: string,
    public readonly title: string,
    public readonly slug: string,
    public readonly createdById: string,
  ) {
    super();
  }

  toPayload(): Record<string, unknown> {
    return {
      courseId: this.courseId,
      title: this.title,
      slug: this.slug,
      createdById: this.createdById,
    };
  }
}
