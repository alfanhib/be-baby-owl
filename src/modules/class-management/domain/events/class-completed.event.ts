import { DomainEvent } from '@shared/domain/domain-event.base';

export class ClassCompletedEvent extends DomainEvent {
  constructor(
    public readonly classId: string,
    public readonly name: string,
  ) {
    super();
  }

  toPayload(): Record<string, unknown> {
    return {
      classId: this.classId,
      name: this.name,
    };
  }
}
