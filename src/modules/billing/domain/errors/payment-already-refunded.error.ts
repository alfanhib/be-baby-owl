import { DomainError } from '@shared/domain/domain-error.base';

export class PaymentAlreadyRefundedError extends DomainError {
  constructor(id: string) {
    super(`Payment ${id} is already refunded`, 'ALREADY_REFUNDED');
  }
}
