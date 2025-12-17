import { DomainError } from '@shared/domain/domain-error.base';

export class EnrollmentNotFoundError extends DomainError {
  constructor(enrollmentId: string) {
    super(
      `Enrollment with id ${enrollmentId} not found`,
      'ENROLLMENT_NOT_FOUND',
    );
  }
}
