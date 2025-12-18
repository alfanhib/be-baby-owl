import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/infrastructure/prisma/prisma.service';
import {
  GamificationRepositoryInterface,
  UserLevel,
  XpTransaction,
  Badge,
  UserBadge,
} from '../../domain';
import { GamificationMapper } from './gamification.mapper';

@Injectable()
export class GamificationRepository implements GamificationRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  // UserLevel
  async findUserLevelByUserId(userId: string): Promise<UserLevel | null> {
    const userLevel = await this.prisma.userLevel.findUnique({
      where: { userId },
    });

    if (!userLevel) return null;

    return GamificationMapper.toDomainUserLevel(userLevel);
  }

  async saveUserLevel(userLevel: UserLevel): Promise<void> {
    const data = GamificationMapper.toPersistenceUserLevel(userLevel);

    await this.prisma.userLevel.update({
      where: { id: data.id },
      data: {
        currentLevel: data.currentLevel,
        totalXp: data.totalXp,
        currentStreak: data.currentStreak,
        lastActivityDate: data.lastActivityDate,
        updatedAt: data.updatedAt,
      },
    });
  }

  async createUserLevel(userLevel: UserLevel): Promise<void> {
    const data = GamificationMapper.toPersistenceUserLevel(userLevel);

    await this.prisma.userLevel.create({
      data: {
        id: data.id,
        userId: data.userId,
        currentLevel: data.currentLevel,
        totalXp: data.totalXp,
        currentStreak: data.currentStreak,
        lastActivityDate: data.lastActivityDate,
      },
    });
  }

  // XP Transactions
  async createXpTransaction(transaction: XpTransaction): Promise<void> {
    const data = GamificationMapper.toPersistenceXpTransaction(transaction);

    await this.prisma.xpTransaction.create({
      data: {
        id: data.id,
        userId: data.userId,
        amount: data.amount,
        reason: data.reason,
        referenceId: data.referenceId,
        createdAt: data.createdAt,
      },
    });
  }

  async findXpTransactionsByUserId(
    userId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<XpTransaction[]> {
    const transactions = await this.prisma.xpTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: options?.limit ?? 20,
      skip: options?.offset ?? 0,
    });

    return transactions.map((t) => GamificationMapper.toDomainXpTransaction(t));
  }

  async countXpTransactionsByUserId(userId: string): Promise<number> {
    return this.prisma.xpTransaction.count({
      where: { userId },
    });
  }

  // Badges
  async findAllBadges(): Promise<Badge[]> {
    const badges = await this.prisma.badge.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return badges.map((b) => GamificationMapper.toDomainBadge(b));
  }

  async findBadgeById(id: string): Promise<Badge | null> {
    const badge = await this.prisma.badge.findUnique({
      where: { id },
    });

    if (!badge) return null;

    return GamificationMapper.toDomainBadge(badge);
  }

  async createBadge(badge: Badge): Promise<void> {
    const data = GamificationMapper.toPersistenceBadge(badge);

    await this.prisma.badge.create({
      data: {
        id: data.id,
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        criteria: data.criteria,
        rarity: data.rarity as 'common' | 'rare' | 'epic' | 'legendary',
        createdAt: data.createdAt,
      },
    });
  }

  // User Badges
  async findUserBadgesByUserId(userId: string): Promise<UserBadge[]> {
    const userBadges = await this.prisma.userBadge.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' },
    });

    return userBadges.map((ub) => GamificationMapper.toDomainUserBadge(ub));
  }

  async findUserBadge(
    userId: string,
    badgeId: string,
  ): Promise<UserBadge | null> {
    const userBadge = await this.prisma.userBadge.findUnique({
      where: {
        userId_badgeId: { userId, badgeId },
      },
    });

    if (!userBadge) return null;

    return GamificationMapper.toDomainUserBadge(userBadge);
  }

  async createUserBadge(userBadge: UserBadge): Promise<void> {
    const data = GamificationMapper.toPersistenceUserBadge(userBadge);

    await this.prisma.userBadge.create({
      data: {
        id: data.id,
        userId: data.userId,
        badgeId: data.badgeId,
        earnedAt: data.earnedAt,
      },
    });
  }

  async countUserBadgesByUserId(userId: string): Promise<number> {
    return this.prisma.userBadge.count({
      where: { userId },
    });
  }

  // Leaderboard
  async getLeaderboard(options: {
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
  > {
    const { limit = 10, offset = 0, period = 'all_time' } = options;

    // For all_time, use UserLevel table directly
    if (period === 'all_time') {
      const userLevels = await this.prisma.userLevel.findMany({
        orderBy: { totalXp: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
            },
          },
        },
      });

      return userLevels.map((ul, index) => ({
        userId: ul.userId,
        fullName: ul.user.fullName,
        avatar: ul.user.avatar,
        totalXp: ul.totalXp,
        level: ul.currentLevel,
        rank: offset + index + 1,
      }));
    }

    // For period-based leaderboard, calculate from XP transactions
    const now = new Date();
    const startDate = this.getStartDateForPeriod(period, now);

    const xpByUser = await this.prisma.xpTransaction.groupBy({
      by: ['userId'],
      where: {
        createdAt: { gte: startDate },
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: limit,
      skip: offset,
    });

    const userIds = xpByUser.map((x) => x.userId);

    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        fullName: true,
        avatar: true,
        userLevel: {
          select: { currentLevel: true },
        },
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    return xpByUser.map((x, index) => {
      const user = userMap.get(x.userId);
      return {
        userId: x.userId,
        fullName: user?.fullName ?? 'Unknown User',
        avatar: user?.avatar ?? null,
        totalXp: x._sum.amount ?? 0,
        level: user?.userLevel?.currentLevel ?? 1,
        rank: offset + index + 1,
      };
    });
  }

  private getStartDateForPeriod(
    period: 'daily' | 'weekly' | 'monthly',
    now: Date,
  ): Date {
    switch (period) {
      case 'daily':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'weekly': {
        const dayOfWeek = now.getDay();
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        return startDate;
      }
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      default:
        return new Date(0);
    }
  }

  // User Stats for badge checking
  async getUserStats(userId: string): Promise<{
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
  }> {
    const [
      lessonsCompleted,
      exercisesCompleted,
      quizAttempts,
      userLevel,
      assignmentsSubmitted,
      codingSubmissions,
    ] = await Promise.all([
      this.prisma.lessonProgress.count({
        where: { userId, completed: true },
      }),
      this.prisma.exerciseProgress.count({
        where: { userId, completed: true },
      }),
      this.prisma.quizAttempt.findMany({
        where: { userId },
        select: { score: true, maxScore: true },
      }),
      this.prisma.userLevel.findUnique({
        where: { userId },
        select: { totalXp: true, currentLevel: true, currentStreak: true },
      }),
      this.prisma.assignmentSubmission.count({
        where: { studentId: userId },
      }),
      this.prisma.codingSubmission.count({
        where: { userId, passed: true },
      }),
    ]);

    const quizzesCompleted = quizAttempts.length;
    const perfectQuizzes = quizAttempts.filter(
      (q) => q.score === q.maxScore,
    ).length;

    // For courses completed, we'd need to check if all lessons in a course are complete
    // This is a simplified version - in production you'd have a proper course completion tracking
    const coursesCompleted = 0; // Would need more complex query

    return {
      lessonsCompleted,
      exercisesCompleted,
      quizzesCompleted,
      perfectQuizzes,
      coursesCompleted,
      streakDays: userLevel?.currentStreak ?? 0,
      xpEarned: userLevel?.totalXp ?? 0,
      levelReached: userLevel?.currentLevel ?? 1,
      assignmentsSubmitted,
      codingChallengesPassed: codingSubmissions,
    };
  }
}
