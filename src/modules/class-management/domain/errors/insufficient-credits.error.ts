import { DomainError } from '@shared/domain/domain-error.base';

export class InsufficientCreditsError extends DomainError {
  constructor(enrollmentId: string) {
    super(
      `Enrollment ${enrollmentId} has no remaining credits`,
      'INSUFFICIENT_CREDITS',
    );
  }
}
