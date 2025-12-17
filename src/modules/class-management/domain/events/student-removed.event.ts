import { DomainEvent } from '@shared/domain/domain-event.base';

export class StudentRemovedEvent extends DomainEvent {
  constructor(
    public readonly classId: string,
    public readonly studentId: string,
    public readonly enrollmentId: string,
    public readonly reason: string,
  ) {
    super();
  }

  toPayload(): Record<string, unknown> {
    return {
      classId: this.classId,
      studentId: this.studentId,
      enrollmentId: this.enrollmentId,
      reason: this.reason,
    };
  }
}
