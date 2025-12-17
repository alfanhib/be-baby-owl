import { DomainEvent } from '@shared/domain/domain-event.base';

export class LessonUnlockedEvent extends DomainEvent {
  constructor(
    public readonly classId: string,
    public readonly lessonId: string,
    public readonly unlockedBy: string,
    public readonly totalUnlocked: number,
  ) {
    super();
  }

  toPayload(): Record<string, unknown> {
    return {
      classId: this.classId,
      lessonId: this.lessonId,
      unlockedBy: this.unlockedBy,
      totalUnlocked: this.totalUnlocked,
    };
  }
}
