import { DomainError } from '@shared/domain/domain-error.base';

export class WeakPasswordError extends DomainError {
  public readonly validationErrors: string[];

  constructor(errors: string[]) {
    super(
      `Password does not meet requirements: ${errors.join(', ')}`,
      'WEAK_PASSWORD',
    );
    this.validationErrors = errors;
  }
}
