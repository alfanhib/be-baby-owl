import { DomainEvent } from '@/shared/domain';

interface LevelUpEventProps {
  userId: string;
  newLevel: number;
  totalXp: number;
}

export class LevelUpEvent extends DomainEvent {
  public readonly userId: string;
  public readonly newLevel: number;
  public readonly totalXp: number;

  constructor(props: LevelUpEventProps) {
    super();
    this.userId = props.userId;
    this.newLevel = props.newLevel;
    this.totalXp = props.totalXp;
  }

  toPayload(): Record<string, unknown> {
    return {
      userId: this.userId,
      newLevel: this.newLevel,
      totalXp: this.totalXp,
    };
  }
}
