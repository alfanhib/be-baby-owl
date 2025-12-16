import { DomainEvent } from '@shared/domain/domain-event.base';

export class LessonCompletedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly lessonId: string,
    public readonly sectionId: string,
    public readonly courseId: string,
  ) {
    super();
  }

  toPayload(): Record<string, unknown> {
    return {
      userId: this.userId,
      lessonId: this.lessonId,
      sectionId: this.sectionId,
      courseId: this.courseId,
    };
  }
}
