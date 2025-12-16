import { ForbiddenError } from '@shared/domain/domain-error.base';

export class UserSuspendedError extends ForbiddenError {
  constructor() {
    super('Your account has been suspended');
  }
}
