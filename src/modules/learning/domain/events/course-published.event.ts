import { DomainEvent } from '@shared/domain/domain-event.base';

export class CoursePublishedEvent extends DomainEvent {
  constructor(
    public readonly courseId: string,
    public readonly title: string,
    public readonly slug: string,
  ) {
    super();
  }

  toPayload(): Record<string, unknown> {
    return {
      courseId: this.courseId,
      title: this.title,
      slug: this.slug,
    };
  }
}
