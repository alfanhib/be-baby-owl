import { DomainEvent } from '@shared/domain/domain-event.base';

export class LessonAddedEvent extends DomainEvent {
  constructor(
    public readonly sectionId: string,
    public readonly lessonId: string,
    public readonly title: string,
  ) {
    super();
  }

  toPayload(): Record<string, unknown> {
    return {
      sectionId: this.sectionId,
      lessonId: this.lessonId,
      title: this.title,
    };
  }
}
