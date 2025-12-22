import { DomainError } from '@shared/domain/domain-error.base';

export class SubmissionNotFoundError extends DomainError {
  constructor(submissionId: string) {
    super(`Submission with ID ${submissionId} not found`);
  }
}

