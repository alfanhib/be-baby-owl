import { ConflictError } from '@shared/domain/domain-error.base';

export class UsernameAlreadyExistsError extends ConflictError {
  constructor(username: string) {
    super(`Username "${username}" sudah digunakan`);
  }
}

