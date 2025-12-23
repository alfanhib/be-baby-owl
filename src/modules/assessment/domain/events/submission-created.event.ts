import { DomainEvent } from '@shared/domain/domain-event.base';

export class SubmissionCreatedEvent extends DomainEvent {
  constructor(
    public readonly submissionId: string,
    public readonly exerciseId: string,
    public readonly studentId: string,
    public readonly submissionType: string,
    public readonly version: number,
  ) {
    super();
  }

  toPayload(): Record<string, unknown> {
    return {
      submissionId: this.submissionId,
      exerciseId: this.exerciseId,
      studentId: this.studentId,
      submissionType: this.submissionType,
      version: this.version,
    };
  }
}
