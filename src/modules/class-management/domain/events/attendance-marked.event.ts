import { DomainEvent } from '@shared/domain/domain-event.base';

export class AttendanceMarkedEvent extends DomainEvent {
  constructor(
    public readonly classId: string,
    public readonly enrollmentId: string,
    public readonly studentId: string,
    public readonly meetingNumber: number,
    public readonly status: string,
    public readonly creditConsumed: boolean,
  ) {
    super();
  }

  toPayload(): Record<string, unknown> {
    return {
      classId: this.classId,
      enrollmentId: this.enrollmentId,
      studentId: this.studentId,
      meetingNumber: this.meetingNumber,
      status: this.status,
      creditConsumed: this.creditConsumed,
    };
  }
}
