import { ValueObject } from '@/shared/domain';

interface StreakProps {
  currentStreak: number;
  lastActivityDate: Date | null;
}

export class Streak extends ValueObject<StreakProps> {
  private constructor(props: StreakProps) {
    super(props);
  }

  get currentStreak(): number {
    return this.props.currentStreak;
  }

  get lastActivityDate(): Date | null {
    return this.props.lastActivityDate;
  }

  public static create(
    currentStreak: number,
    lastActivityDate: Date | null,
  ): Streak {
    return new Streak({
      currentStreak: Math.max(0, currentStreak),
      lastActivityDate,
    });
  }

  public static zero(): Streak {
    return new Streak({ currentStreak: 0, lastActivityDate: null });
  }

  private static isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  private static isYesterday(lastDate: Date, today: Date): boolean {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return Streak.isSameDay(lastDate, yesterday);
  }

  public recordActivity(activityDate: Date = new Date()): Streak {
    // If no previous activity, start streak at 1
    if (!this.lastActivityDate) {
      return Streak.create(1, activityDate);
    }

    // If activity is on the same day, keep current streak
    if (Streak.isSameDay(this.lastActivityDate, activityDate)) {
      return Streak.create(this.currentStreak, activityDate);
    }

    // If activity is the next day, increment streak
    if (Streak.isYesterday(this.lastActivityDate, activityDate)) {
      return Streak.create(this.currentStreak + 1, activityDate);
    }

    // Otherwise, streak is broken, start from 1
    return Streak.create(1, activityDate);
  }

  public isActive(today: Date = new Date()): boolean {
    if (!this.lastActivityDate) {
      return false;
    }

    // Streak is active if last activity was today or yesterday
    return (
      Streak.isSameDay(this.lastActivityDate, today) ||
      Streak.isYesterday(this.lastActivityDate, today)
    );
  }

  public getStreakBonus(): number {
    // Bonus XP based on streak length
    if (this.currentStreak >= 30) return 50;
    if (this.currentStreak >= 14) return 30;
    if (this.currentStreak >= 7) return 20;
    if (this.currentStreak >= 3) return 10;
    return 0;
  }

  public getMilestone(): number | null {
    const milestones = [3, 7, 14, 30, 60, 90, 180, 365];
    return milestones.find((m) => m === this.currentStreak) ?? null;
  }
}
