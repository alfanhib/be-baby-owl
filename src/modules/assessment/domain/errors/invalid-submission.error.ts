import { DomainError } from '@shared/domain/domain-error.base';

export class InvalidSubmissionError extends DomainError {
  constructor(reason: string) {
    super(`Invalid submission: ${reason}`);
  }
}
