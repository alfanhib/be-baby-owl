import { DomainEvent } from '@shared/domain/domain-event.base';

export class SubmissionGradedEvent extends DomainEvent {
  constructor(
    public readonly submissionId: string,
    public readonly exerciseId: string,
    public readonly studentId: string,
    public readonly gradedById: string,
    public readonly score: number,
    public readonly maxScore: number,
    public readonly feedback: string | null,
  ) {
    super();
  }

  toPayload(): Record<string, unknown> {
    return {
      submissionId: this.submissionId,
      exerciseId: this.exerciseId,
      studentId: this.studentId,
      gradedById: this.gradedById,
      score: this.score,
      maxScore: this.maxScore,
      feedback: this.feedback,
    };
  }
}
