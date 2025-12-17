import { DomainError } from '@shared/domain/domain-error.base';

export class ClassNotFoundError extends DomainError {
  constructor(classId: string) {
    super(`Class with id ${classId} not found`, 'CLASS_NOT_FOUND');
  }
}
