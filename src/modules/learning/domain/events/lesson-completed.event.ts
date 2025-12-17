import { DomainEvent } from '@shared/domain/domain-event.base';

export class LessonCompletedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly lessonId: string,
    public readonly courseId: string,
    public readonly sectionId?: string,
  ) {
    super();
  }

  toPayload(): Record<string, unknown> {
    return {
      userId: this.userId,
      lessonId: this.lessonId,
      courseId: this.courseId,
      sectionId: this.sectionId,
    };
  }
}
