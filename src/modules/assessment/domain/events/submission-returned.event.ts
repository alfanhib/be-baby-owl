import { DomainEvent } from '@shared/domain/domain-event.base';

export class SubmissionReturnedEvent extends DomainEvent {
  constructor(
    public readonly submissionId: string,
    public readonly exerciseId: string,
    public readonly studentId: string,
    public readonly returnedById: string,
    public readonly feedback: string,
  ) {
    super();
  }

  toPayload(): Record<string, unknown> {
    return {
      submissionId: this.submissionId,
      exerciseId: this.exerciseId,
      studentId: this.studentId,
      returnedById: this.returnedById,
      feedback: this.feedback,
    };
  }
}
