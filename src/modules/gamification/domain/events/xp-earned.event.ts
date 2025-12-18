import { DomainEvent } from '@/shared/domain';

interface XpEarnedEventProps {
  userId: string;
  amount: number;
  reason: string;
  referenceId?: string;
  newTotalXp: number;
  newLevel: number;
}

export class XpEarnedEvent extends DomainEvent {
  public readonly userId: string;
  public readonly amount: number;
  public readonly reason: string;
  public readonly referenceId?: string;
  public readonly newTotalXp: number;
  public readonly newLevel: number;

  constructor(props: XpEarnedEventProps) {
    super();
    this.userId = props.userId;
    this.amount = props.amount;
    this.reason = props.reason;
    this.referenceId = props.referenceId;
    this.newTotalXp = props.newTotalXp;
    this.newLevel = props.newLevel;
  }

  toPayload(): Record<string, unknown> {
    return {
      userId: this.userId,
      amount: this.amount,
      reason: this.reason,
      referenceId: this.referenceId,
      newTotalXp: this.newTotalXp,
      newLevel: this.newLevel,
    };
  }
}
