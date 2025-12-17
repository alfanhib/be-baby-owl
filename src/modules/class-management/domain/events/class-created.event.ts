import { DomainEvent } from '@shared/domain/domain-event.base';

export class ClassCreatedEvent extends DomainEvent {
  constructor(
    public readonly classId: string,
    public readonly name: string,
    public readonly courseId: string,
    public readonly instructorId: string,
    public readonly type: string,
  ) {
    super();
  }

  toPayload(): Record<string, unknown> {
    return {
      classId: this.classId,
      name: this.name,
      courseId: this.courseId,
      instructorId: this.instructorId,
      type: this.type,
    };
  }
}
