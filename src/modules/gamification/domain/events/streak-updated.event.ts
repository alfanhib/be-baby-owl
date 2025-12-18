import { DomainEvent } from '@/shared/domain';

interface StreakUpdatedEventProps {
  userId: string;
  currentStreak: number;
  previousStreak: number;
}

export class StreakUpdatedEvent extends DomainEvent {
  public readonly userId: string;
  public readonly currentStreak: number;
  public readonly previousStreak: number;

  constructor(props: StreakUpdatedEventProps) {
    super();
    this.userId = props.userId;
    this.currentStreak = props.currentStreak;
    this.previousStreak = props.previousStreak;
  }

  toPayload(): Record<string, unknown> {
    return {
      userId: this.userId,
      currentStreak: this.currentStreak,
      previousStreak: this.previousStreak,
    };
  }
}
