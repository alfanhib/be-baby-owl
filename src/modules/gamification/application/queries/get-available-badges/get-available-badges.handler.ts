import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAvailableBadgesQuery } from './get-available-badges.query';
import {
  GAMIFICATION_REPOSITORY,
  GamificationRepositoryInterface,
  BadgeCriteria,
} from '../../../domain';

export interface AvailableBadgeResponse {
  badgeId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  rarity: string;
  criteria: BadgeCriteria;
  isEarned: boolean;
  progress?: number; // Percentage progress towards earning (0-100)
}

@QueryHandler(GetAvailableBadgesQuery)
export class GetAvailableBadgesHandler implements IQueryHandler<GetAvailableBadgesQuery> {
  constructor(
    @Inject(GAMIFICATION_REPOSITORY)
    private readonly repository: GamificationRepositoryInterface,
  ) {}

  async execute(query: GetAvailableBadgesQuery): Promise<{
    badges: AvailableBadgeResponse[];
    earnedCount: number;
    totalCount: number;
  }> {
    const { userId } = query;

    const allBadges = await this.repository.findAllBadges();

    let earnedBadgeIds = new Set<string>();
    let userStats: {
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
    } | null = null;

    if (userId) {
      const userBadges = await this.repository.findUserBadgesByUserId(userId);
      earnedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId));
      userStats = await this.repository.getUserStats(userId);
    }

    const badges: AvailableBadgeResponse[] = allBadges.map((badge) => {
      const isEarned = earnedBadgeIds.has(badge.id);
      let progress: number | undefined;

      if (userId && userStats && !isEarned) {
        progress = this.calculateProgress(badge.criteria, userStats);
      }

      return {
        badgeId: badge.id,
        name: badge.name,
        description: badge.description,
        imageUrl: badge.imageUrl,
        rarity: badge.rarity.value,
        criteria: badge.criteria,
        isEarned,
        progress,
      };
    });

    return {
      badges,
      earnedCount: earnedBadgeIds.size,
      totalCount: allBadges.length,
    };
  }

  private calculateProgress(
    criteria: BadgeCriteria,
    userStats: {
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
    },
  ): number {
    const { type, threshold } = criteria;
    let current = 0;

    switch (type) {
      case 'lessons_completed':
        current = userStats.lessonsCompleted;
        break;
      case 'exercises_completed':
        current = userStats.exercisesCompleted;
        break;
      case 'quizzes_completed':
        current = userStats.quizzesCompleted;
        break;
      case 'perfect_quizzes':
        current = userStats.perfectQuizzes;
        break;
      case 'courses_completed':
        current = userStats.coursesCompleted;
        break;
      case 'streak_days':
        current = userStats.streakDays;
        break;
      case 'xp_earned':
        current = userStats.xpEarned;
        break;
      case 'level_reached':
        current = userStats.levelReached;
        break;
      case 'assignments_submitted':
        current = userStats.assignmentsSubmitted;
        break;
      case 'coding_challenges_passed':
        current = userStats.codingChallengesPassed;
        break;
    }

    return Math.min(100, Math.floor((current / threshold) * 100));
  }
}
