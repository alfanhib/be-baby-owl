import { DomainError } from '@/shared/domain';

export class BadgeAlreadyEarnedError extends DomainError {
  constructor(userId: string, badgeId: string) {
    super(`User ${userId} has already earned badge ${badgeId}`);
    this.name = 'BadgeAlreadyEarnedError';
  }
}
