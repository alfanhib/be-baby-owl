import { DomainError } from '@shared/domain/domain-error.base';

export class PaymentAlreadyVerifiedError extends DomainError {
  constructor(id: string) {
    super(`Payment ${id} is already verified`, 'ALREADY_VERIFIED');
  }
}
