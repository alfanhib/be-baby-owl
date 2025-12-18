import { DomainEvent } from '@/shared/domain';

interface BadgeEarnedEventProps {
  userId: string;
  badgeId: string;
  badgeName: string;
  badgeRarity: string;
}

export class BadgeEarnedEvent extends DomainEvent {
  public readonly userId: string;
  public readonly badgeId: string;
  public readonly badgeName: string;
  public readonly badgeRarity: string;

  constructor(props: BadgeEarnedEventProps) {
    super();
    this.userId = props.userId;
    this.badgeId = props.badgeId;
    this.badgeName = props.badgeName;
    this.badgeRarity = props.badgeRarity;
  }

  toPayload(): Record<string, unknown> {
    return {
      userId: this.userId,
      badgeId: this.badgeId,
      badgeName: this.badgeName,
      badgeRarity: this.badgeRarity,
    };
  }
}
