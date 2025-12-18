import { DomainEvent } from '@shared/domain/domain-event.base';

export class PaymentRefundedEvent extends DomainEvent {
  constructor(
    public readonly paymentId: string,
    public readonly refundedBy: string,
    public readonly refundAmount: number,
    public readonly reason: string,
    public readonly studentEmail: string | null,
  ) {
    super();
  }

  toPayload(): Record<string, unknown> {
    return {
      paymentId: this.paymentId,
      refundedBy: this.refundedBy,
      refundAmount: this.refundAmount,
      reason: this.reason,
      studentEmail: this.studentEmail,
    };
  }
}
