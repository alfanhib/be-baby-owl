import { DomainError } from '@shared/domain/domain-error.base';

export class PaymentAlreadyRejectedError extends DomainError {
  constructor(id: string) {
    super(`Payment ${id} is already rejected`, 'ALREADY_REJECTED');
  }
}
