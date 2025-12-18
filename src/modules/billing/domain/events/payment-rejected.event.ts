import { DomainEvent } from '@shared/domain/domain-event.base';

export class PaymentRejectedEvent extends DomainEvent {
  constructor(
    public readonly paymentId: string,
    public readonly rejectedBy: string,
    public readonly reason: string,
    public readonly studentEmail: string | null,
  ) {
    super();
  }

  toPayload(): Record<string, unknown> {
    return {
      paymentId: this.paymentId,
      rejectedBy: this.rejectedBy,
      reason: this.reason,
      studentEmail: this.studentEmail,
    };
  }
}
