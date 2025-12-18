import { UserLevel } from '../aggregates';
import { Badge, UserBadge, XpTransaction } from '../entities';

export interface GamificationRepositoryInterface {
  // UserLevel
  findUserLevelByUserId(userId: string): Promise<UserLevel | null>;
  saveUserLevel(userLevel: UserLevel): Promise<void>;
  createUserLevel(userLevel: UserLevel): Promise<void>;

  // XP Transactions
  createXpTransaction(transaction: XpTransaction): Promise<void>;
  findXpTransactionsByUserId(
    userId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<XpTransaction[]>;
  countXpTransactionsByUserId(userId: string): Promise<number>;

  // Badges
  findAllBadges(): Promise<Badge[]>;
  findBadgeById(id: string): Promise<Badge | null>;
  createBadge(badge: Badge): Promise<void>;

  // User Badges
  findUserBadgesByUserId(userId: string): Promise<UserBadge[]>;
  findUserBadge(userId: string, badgeId: string): Promise<UserBadge | null>;
  createUserBadge(userBadge: UserBadge): Promise<void>;
  countUserBadgesByUserId(userId: string): Promise<number>;

  // Leaderboard
  getLeaderboard(options: {
    limit?: number;
    offset?: number;
    period?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  }): Promise<
    Array<{
      userId: string;
      fullName: string;
      avatar: string | null;
      totalXp: number;
      level: number;
      rank: number;
    }>
  >;

  // Stats for badge checking
  getUserStats(userId: string): Promise<{
    lessonsCompleted: number;
    exercisesCompleted: number;
    quizzesCompleted: number;
    perfectQuizzes: number;
    coursesCompleted: number;
    streakDays: number;
    xpEarned: number;
    levelReached: number;
    assignmentsSubmitted: number;
    codingChallengesPassed: number;
  }>;
}

export const GAMIFICATION_REPOSITORY = Symbol('GAMIFICATION_REPOSITORY');
