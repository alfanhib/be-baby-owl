import { DomainEvent } from '@shared/domain/domain-event.base';

export class StudentEnrolledEvent extends DomainEvent {
  constructor(
    public readonly classId: string,
    public readonly studentId: string,
    public readonly enrollmentId: string,
    public readonly totalCredits: number,
  ) {
    super();
  }

  toPayload(): Record<string, unknown> {
    return {
      classId: this.classId,
      studentId: this.studentId,
      enrollmentId: this.enrollmentId,
      totalCredits: this.totalCredits,
    };
  }
}
