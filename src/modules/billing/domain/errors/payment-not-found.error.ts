import { DomainError } from '@shared/domain/domain-error.base';

export class PaymentNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Payment with id ${id} not found`, 'PAYMENT_NOT_FOUND');
  }
}
