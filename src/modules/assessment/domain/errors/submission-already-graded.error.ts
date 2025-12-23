import { DomainError } from '@shared/domain/domain-error.base';

export class SubmissionAlreadyGradedError extends DomainError {
  constructor(submissionId: string) {
    super(`Submission ${submissionId} has already been graded`);
  }
}
