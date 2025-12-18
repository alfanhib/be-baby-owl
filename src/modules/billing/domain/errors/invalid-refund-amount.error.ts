import { DomainError } from '@shared/domain/domain-error.base';

export class InvalidRefundAmountError extends DomainError {
  constructor(refundAmount: number, paymentAmount: number) {
    super(
      `Refund amount ${refundAmount} exceeds payment amount ${paymentAmount}`,
      'INVALID_REFUND_AMOUNT',
    );
  }
}
