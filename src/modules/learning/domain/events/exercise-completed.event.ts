import { DomainEvent } from '@shared/domain/domain-event.base';

export class ExerciseCompletedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly exerciseId: string,
    public readonly lessonId: string,
    public readonly exerciseType?: string,
  ) {
    super();
  }

  toPayload(): Record<string, unknown> {
    return {
      userId: this.userId,
      exerciseId: this.exerciseId,
      lessonId: this.lessonId,
      exerciseType: this.exerciseType,
    };
  }
}
