import { DomainEvent } from '@shared/domain/domain-event.base';
import { CreditAdjustmentType } from '../entities/credit-adjustment.entity';

export class CreditAdjustedEvent extends DomainEvent {
  constructor(
    public readonly classId: string,
    public readonly enrollmentId: string,
    public readonly studentId: string,
    public readonly amount: number,
    public readonly type: CreditAdjustmentType,
    public readonly reason: string,
    public readonly previousTotal: number,
    public readonly newTotal: number,
  ) {
    super();
  }

  toPayload(): Record<string, unknown> {
    return {
      classId: this.classId,
      enrollmentId: this.enrollmentId,
      studentId: this.studentId,
      amount: this.amount,
      type: this.type,
      reason: this.reason,
      previousTotal: this.previousTotal,
      newTotal: this.newTotal,
    };
  }
}
