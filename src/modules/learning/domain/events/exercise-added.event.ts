import { DomainEvent } from '@shared/domain/domain-event.base';

export class ExerciseAddedEvent extends DomainEvent {
  constructor(
    public readonly lessonId: string,
    public readonly exerciseId: string,
    public readonly title: string,
    public readonly type: string,
  ) {
    super();
  }

  toPayload(): Record<string, unknown> {
    return {
      lessonId: this.lessonId,
      exerciseId: this.exerciseId,
      title: this.title,
      type: this.type,
    };
  }
}
