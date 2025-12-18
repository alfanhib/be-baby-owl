import { AggregateRoot } from '@/shared/domain';
import { XpAmount, Level, Streak } from '../value-objects';
import { XpEarnedEvent, LevelUpEvent, StreakUpdatedEvent } from '../events';

export class UserLevel extends AggregateRoot<string> {
  private _userId: string;
  private _currentLevel: Level;
  private _totalXp: XpAmount;
  private _streak: Streak;

  private constructor(
    id: string,
    userId: string,
    currentLevel: Level,
    totalXp: XpAmount,
    streak: Streak,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt, updatedAt);
    this._userId = userId;
    this._currentLevel = currentLevel;
    this._totalXp = totalXp;
    this._streak = streak;
  }

  get userId(): string {
    return this._userId;
  }

  get currentLevel(): Level {
    return this._currentLevel;
  }

  get totalXp(): XpAmount {
    return this._totalXp;
  }

  get streak(): Streak {
    return this._streak;
  }

  public static create(userId: string, id?: string): UserLevel {
    return new UserLevel(
      id ?? crypto.randomUUID(),
      userId,
      Level.create(1),
      XpAmount.zero(),
      Streak.zero(),
    );
  }

  public static reconstitute(
    props: {
      userId: string;
      currentLevel: number;
      totalXp: number;
      currentStreak: number;
      lastActivityDate: Date | null;
      updatedAt: Date;
    },
    id: string,
  ): UserLevel {
    return new UserLevel(
      id,
      props.userId,
      Level.create(props.currentLevel),
      XpAmount.create(props.totalXp),
      Streak.create(props.currentStreak, props.lastActivityDate),
      undefined,
      props.updatedAt,
    );
  }

  public addXp(amount: number, reason: string, referenceId?: string): void {
    const xpAmount = XpAmount.create(amount);
    const previousLevel = this._currentLevel.value;

    this._totalXp = this._totalXp.add(xpAmount);
    this.touch();

    // Check for level up
    const newLevel = Level.fromXp(this._totalXp);
    if (newLevel.value > previousLevel) {
      this._currentLevel = newLevel;

      // Emit level up event for each level gained
      for (let level = previousLevel + 1; level <= newLevel.value; level++) {
        this.addDomainEvent(
          new LevelUpEvent({
            userId: this._userId,
            newLevel: level,
            totalXp: this._totalXp.value,
          }),
        );
      }
    }

    // Emit XP earned event
    this.addDomainEvent(
      new XpEarnedEvent({
        userId: this._userId,
        amount: xpAmount.value,
        reason,
        referenceId,
        newTotalXp: this._totalXp.value,
        newLevel: this._currentLevel.value,
      }),
    );
  }

  public recordActivity(activityDate: Date = new Date()): void {
    const previousStreak = this._streak.currentStreak;
    this._streak = this._streak.recordActivity(activityDate);
    this.touch();

    // Check if streak increased
    if (this._streak.currentStreak > previousStreak) {
      this.addDomainEvent(
        new StreakUpdatedEvent({
          userId: this._userId,
          currentStreak: this._streak.currentStreak,
          previousStreak,
        }),
      );

      // Check for streak milestone bonus
      const milestone = this._streak.getMilestone();
      if (milestone) {
        const bonusXp = this._streak.getStreakBonus();
        if (bonusXp > 0) {
          this.addXp(bonusXp, 'streak_bonus');
        }
      }
    }
  }

  public getProgressToNextLevel(): number {
    return this._currentLevel.getProgressToNextLevel(this._totalXp);
  }

  public getXpForNextLevel(): number {
    return this._currentLevel.getXpForNextLevel();
  }

  public getXpInCurrentLevel(): number {
    return this._totalXp.value - this._currentLevel.getXpForCurrentLevel();
  }

  public isMaxLevel(): boolean {
    return this._currentLevel.isMaxLevel();
  }
}
