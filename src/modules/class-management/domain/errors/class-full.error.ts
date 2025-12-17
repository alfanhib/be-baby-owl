import { DomainError } from '@shared/domain/domain-error.base';

export class ClassFullError extends DomainError {
  constructor(classId: string) {
    super(
      `Class ${classId} is full and cannot accept more students`,
      'CLASS_FULL',
    );
  }
}
