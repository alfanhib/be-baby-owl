import { DomainError } from '@/shared/domain';

export class UserLevelNotFoundError extends DomainError {
  constructor(userId: string) {
    super(`User level for user ${userId} not found`);
    this.name = 'UserLevelNotFoundError';
  }
}
