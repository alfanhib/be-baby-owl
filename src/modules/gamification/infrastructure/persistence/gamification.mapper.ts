import {
  UserLevel as PrismaUserLevel,
  XpTransaction as PrismaXpTransaction,
  Badge as PrismaBadge,
  UserBadge as PrismaUserBadge,
} from '@prisma/client';

import {
  UserLevel,
  XpTransaction,
  Badge,
  UserBadge,
  BadgeCriteria,
} from '../../domain';

export class GamificationMapper {
  // UserLevel
  static toDomainUserLevel(prismaUserLevel: PrismaUserLevel): UserLevel {
    return UserLevel.reconstitute(
      {
        userId: prismaUserLevel.userId,
        currentLevel: prismaUserLevel.currentLevel,
        totalXp: prismaUserLevel.totalXp,
        currentStreak: prismaUserLevel.currentStreak,
        lastActivityDate: prismaUserLevel.lastActivityDate,
        updatedAt: prismaUserLevel.updatedAt,
      },
      prismaUserLevel.id,
    );
  }

  static toPersistenceUserLevel(userLevel: UserLevel): {
    id: string;
    userId: string;
    currentLevel: number;
    totalXp: number;
    currentStreak: number;
    lastActivityDate: Date | null;
    updatedAt: Date;
  } {
    return {
      id: userLevel.id,
      userId: userLevel.userId,
      currentLevel: userLevel.currentLevel.value,
      totalXp: userLevel.totalXp.value,
      currentStreak: userLevel.streak.currentStreak,
      lastActivityDate: userLevel.streak.lastActivityDate,
      updatedAt: userLevel.updatedAt,
    };
  }

  // XpTransaction
  static toDomainXpTransaction(
    prismaTransaction: PrismaXpTransaction,
  ): XpTransaction {
    return XpTransaction.reconstitute(
      {
        userId: prismaTransaction.userId,
        amount: prismaTransaction.amount,
        reason: prismaTransaction.reason ?? 'unknown',
        referenceId: prismaTransaction.referenceId ?? undefined,
        createdAt: prismaTransaction.createdAt,
      },
      prismaTransaction.id,
    );
  }

  static toPersistenceXpTransaction(transaction: XpTransaction): {
    id: string;
    userId: string;
    amount: number;
    reason: string;
    referenceId: string | null;
    createdAt: Date;
  } {
    return {
      id: transaction.id,
      userId: transaction.userId,
      amount: transaction.amount.value,
      reason: transaction.reason.value,
      referenceId: transaction.referenceId ?? null,
      createdAt: transaction.createdAt,
    };
  }

  // Badge
  static toDomainBadge(prismaBadge: PrismaBadge): Badge {
    const criteria = prismaBadge.criteria as unknown as BadgeCriteria | null;
    const defaultCriteria: BadgeCriteria = { type: 'xp_earned', threshold: 0 };

    return Badge.reconstitute(
      {
        name: prismaBadge.name,
        description: prismaBadge.description ?? undefined,
        imageUrl: prismaBadge.imageUrl ?? undefined,
        criteria: criteria ?? defaultCriteria,
        rarity: prismaBadge.rarity,
        createdAt: prismaBadge.createdAt,
      },
      prismaBadge.id,
    );
  }

  static toPersistenceBadge(badge: Badge): {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    criteria: object;
    rarity: string;
    createdAt: Date;
  } {
    return {
      id: badge.id,
      name: badge.name,
      description: badge.description ?? null,
      imageUrl: badge.imageUrl ?? null,
      criteria: badge.criteria as object,
      rarity: badge.rarity.value,
      createdAt: badge.createdAt,
    };
  }

  // UserBadge
  static toDomainUserBadge(prismaUserBadge: PrismaUserBadge): UserBadge {
    return UserBadge.reconstitute(
      {
        userId: prismaUserBadge.userId,
        badgeId: prismaUserBadge.badgeId,
        earnedAt: prismaUserBadge.earnedAt,
      },
      prismaUserBadge.id,
    );
  }

  static toPersistenceUserBadge(userBadge: UserBadge): {
    id: string;
    userId: string;
    badgeId: string;
    earnedAt: Date;
  } {
    return {
      id: userBadge.id,
      userId: userBadge.userId,
      badgeId: userBadge.badgeId,
      earnedAt: userBadge.earnedAt,
    };
  }
}
