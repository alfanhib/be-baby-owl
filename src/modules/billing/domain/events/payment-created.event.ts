import { DomainEvent } from '@shared/domain/domain-event.base';

export class PaymentCreatedEvent extends DomainEvent {
  constructor(
    public readonly paymentId: string,
    public readonly studentName: string,
    public readonly studentEmail: string,
    public readonly courseId: string | null,
    public readonly amount: number,
    public readonly method: string,
  ) {
    super();
  }

  toPayload(): Record<string, unknown> {
    return {
      paymentId: this.paymentId,
      studentName: this.studentName,
      studentEmail: this.studentEmail,
      courseId: this.courseId,
      amount: this.amount,
      method: this.method,
    };
  }
}
