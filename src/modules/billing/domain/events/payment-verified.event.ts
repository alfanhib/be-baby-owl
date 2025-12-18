import { DomainEvent } from '@shared/domain/domain-event.base';

export class PaymentVerifiedEvent extends DomainEvent {
  constructor(
    public readonly paymentId: string,
    public readonly verifiedBy: string,
    public readonly amount: number,
    public readonly studentEmail: string | null,
  ) {
    super();
  }

  toPayload(): Record<string, unknown> {
    return {
      paymentId: this.paymentId,
      verifiedBy: this.verifiedBy,
      amount: this.amount,
      studentEmail: this.studentEmail,
    };
  }
}
