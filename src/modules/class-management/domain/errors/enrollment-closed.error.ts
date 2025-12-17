import { DomainError } from '@shared/domain/domain-error.base';

export class EnrollmentClosedError extends DomainError {
  constructor(classId: string) {
    super(`Enrollment for class ${classId} is closed`, 'ENROLLMENT_CLOSED');
  }
}
