import { DomainError } from '@/shared/domain';

export class BadgeNotFoundError extends DomainError {
  constructor(badgeId: string) {
    super(`Badge with id ${badgeId} not found`);
    this.name = 'BadgeNotFoundError';
  }
}
