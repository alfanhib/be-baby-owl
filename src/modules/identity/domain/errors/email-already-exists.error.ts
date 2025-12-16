import { ConflictError } from '@shared/domain/domain-error.base';

export class EmailAlreadyExistsError extends ConflictError {
  constructor(email: string) {
    super(`User with email ${email} already exists`);
  }
}
