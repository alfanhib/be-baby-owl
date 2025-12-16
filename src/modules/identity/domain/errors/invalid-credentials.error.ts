import { UnauthorizedError } from '@shared/domain/domain-error.base';

export class InvalidCredentialsError extends UnauthorizedError {
  constructor() {
    super('Invalid email or password');
  }
}
