import { EntityNotFoundError } from '@shared/domain/domain-error.base';

export class UserNotFoundError extends EntityNotFoundError {
  constructor(identifier: string) {
    super('User', identifier);
  }
}
