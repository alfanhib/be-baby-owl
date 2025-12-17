import { Entity } from '@shared/domain/entity.base';
import { CreditAdjustmentId } from '../value-objects/enrollment-id.vo';

export enum CreditAdjustmentType {
  ADDITION = 'addition',
  DEDUCTION = 'deduction',
  REFUND = 'refund',
  CORRECTION = 'correction',
}

interface CreditAdjustmentProps {
  enrollmentId: string;
  amount: number; // positive = add credits, negative = remove credits
  type: CreditAdjustmentType;
  reason: string;
  adjustedBy: string;
  adjustedAt: Date;
  previousTotal: number;
  newTotal: number;
}

export class CreditAdjustment extends Entity<CreditAdjustmentId> {
  private _enrollmentId: string;
  private _amount: number;
  private _type: CreditAdjustmentType;
  private _reason: string;
  private _adjustedBy: string;
  private _adjustedAt: Date;
  private _previousTotal: number;
  private _newTotal: number;

  private constructor(id: CreditAdjustmentId, props: CreditAdjustmentProps) {
    super(id);
    this._enrollmentId = props.enrollmentId;
    this._amount = props.amount;
    this._type = props.type;
    this._reason = props.reason;
    this._adjustedBy = props.adjustedBy;
    this._adjustedAt = props.adjustedAt;
    this._previousTotal = props.previousTotal;
    this._newTotal = props.newTotal;
  }

  // Getters
  get enrollmentId(): string {
    return this._enrollmentId;
  }

  get amount(): number {
    return this._amount;
  }

  get type(): CreditAdjustmentType {
    return this._type;
  }

  get reason(): string {
    return this._reason;
  }

  get adjustedBy(): string {
    return this._adjustedBy;
  }

  get adjustedAt(): Date {
    return this._adjustedAt;
  }

  get previousTotal(): number {
    return this._previousTotal;
  }

  get newTotal(): number {
    return this._newTotal;
  }

  get isAddition(): boolean {
    return this._amount > 0;
  }

  get isDeduction(): boolean {
    return this._amount < 0;
  }

  // Factory methods
  static create(
    enrollmentId: string,
    amount: number,
    type: CreditAdjustmentType,
    reason: string,
    adjustedBy: string,
    previousTotal: number,
  ): CreditAdjustment {
    return new CreditAdjustment(CreditAdjustmentId.create(), {
      enrollmentId,
      amount,
      type,
      reason,
      adjustedBy,
      adjustedAt: new Date(),
      previousTotal,
      newTotal: previousTotal + amount,
    });
  }

  static restore(
    id: string,
    props: {
      enrollmentId: string;
      amount: number;
      type: string;
      reason: string;
      adjustedBy: string;
      adjustedAt: Date;
      previousTotal: number;
      newTotal: number;
    },
  ): CreditAdjustment {
    return new CreditAdjustment(CreditAdjustmentId.create(id), {
      enrollmentId: props.enrollmentId,
      amount: props.amount,
      type: props.type as CreditAdjustmentType,
      reason: props.reason,
      adjustedBy: props.adjustedBy,
      adjustedAt: props.adjustedAt,
      previousTotal: props.previousTotal,
      newTotal: props.newTotal,
    });
  }
}
