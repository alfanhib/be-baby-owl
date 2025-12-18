import { Entity } from '@/shared/domain';
import { XpAmount, XpReason } from '../value-objects';

export class XpTransaction extends Entity<string> {
  private _userId: string;
  private _amount: XpAmount;
  private _reason: XpReason;
  private _referenceId?: string;

  private constructor(
    id: string,
    userId: string,
    amount: XpAmount,
    reason: XpReason,
    referenceId?: string,
    createdAt?: Date,
  ) {
    super(id, createdAt);
    this._userId = userId;
    this._amount = amount;
    this._reason = reason;
    this._referenceId = referenceId;
  }

  get userId(): string {
    return this._userId;
  }

  get amount(): XpAmount {
    return this._amount;
  }

  get reason(): XpReason {
    return this._reason;
  }

  get referenceId(): string | undefined {
    return this._referenceId;
  }

  public static create(props: {
    userId: string;
    amount: number;
    reason: string;
    referenceId?: string;
  }): XpTransaction {
    return new XpTransaction(
      crypto.randomUUID(),
      props.userId,
      XpAmount.create(props.amount),
      XpReason.create(props.reason),
      props.referenceId,
    );
  }

  public static reconstitute(
    props: {
      userId: string;
      amount: number;
      reason: string;
      referenceId?: string;
      createdAt: Date;
    },
    id: string,
  ): XpTransaction {
    return new XpTransaction(
      id,
      props.userId,
      XpAmount.create(props.amount),
      XpReason.create(props.reason),
      props.referenceId,
      props.createdAt,
    );
  }
}
