import { Entity } from '@/shared/domain';

export class UserBadge extends Entity<string> {
  private _userId: string;
  private _badgeId: string;
  private _earnedAt: Date;

  private constructor(
    id: string,
    userId: string,
    badgeId: string,
    earnedAt: Date,
  ) {
    super(id, earnedAt);
    this._userId = userId;
    this._badgeId = badgeId;
    this._earnedAt = earnedAt;
  }

  get userId(): string {
    return this._userId;
  }

  get badgeId(): string {
    return this._badgeId;
  }

  get earnedAt(): Date {
    return this._earnedAt;
  }

  public static create(props: { userId: string; badgeId: string }): UserBadge {
    return new UserBadge(
      crypto.randomUUID(),
      props.userId,
      props.badgeId,
      new Date(),
    );
  }

  public static reconstitute(
    props: {
      userId: string;
      badgeId: string;
      earnedAt: Date;
    },
    id: string,
  ): UserBadge {
    return new UserBadge(id, props.userId, props.badgeId, props.earnedAt);
  }
}
