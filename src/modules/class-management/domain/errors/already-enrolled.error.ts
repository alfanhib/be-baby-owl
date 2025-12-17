import { DomainError } from '@shared/domain/domain-error.base';

export class AlreadyEnrolledError extends DomainError {
  constructor(studentId: string, classId: string) {
    super(
      `Student ${studentId} is already enrolled in class ${classId}`,
      'ALREADY_ENROLLED',
    );
  }
}
