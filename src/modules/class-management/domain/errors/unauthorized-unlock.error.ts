import { DomainError } from '@shared/domain/domain-error.base';

export class UnauthorizedUnlockError extends DomainError {
  constructor(userId: string, classId: string) {
    super(
      `User ${userId} is not authorized to unlock lessons for class ${classId}`,
      'UNAUTHORIZED_UNLOCK',
    );
  }
}
