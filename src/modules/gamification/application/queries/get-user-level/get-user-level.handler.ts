import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUserLevelQuery } from './get-user-level.query';
import {
  GAMIFICATION_REPOSITORY,
  GamificationRepositoryInterface,
  Level,
} from '../../../domain';

export interface UserLevelResponse {
  userId: string;
  level: number;
  totalXp: number;
  xpInCurrentLevel: number;
  xpForNextLevel: number;
  progressToNextLevel: number;
  isMaxLevel: boolean;
  currentStreak: number;
  isStreakActive: boolean;
  streakBonus: number;
}

@QueryHandler(GetUserLevelQuery)
export class GetUserLevelHandler implements IQueryHandler<GetUserLevelQuery> {
  constructor(
    @Inject(GAMIFICATION_REPOSITORY)
    private readonly repository: GamificationRepositoryInterface,
  ) {}

  async execute(query: GetUserLevelQuery): Promise<UserLevelResponse> {
    const { userId } = query;

    const userLevel = await this.repository.findUserLevelByUserId(userId);

    if (!userLevel) {
      // Return default level 1 stats
      return {
        userId,
        level: 1,
        totalXp: 0,
        xpInCurrentLevel: 0,
        xpForNextLevel: Level.getXpRequiredForNextLevel(1),
        progressToNextLevel: 0,
        isMaxLevel: false,
        currentStreak: 0,
        isStreakActive: false,
        streakBonus: 0,
      };
    }

    return {
      userId,
      level: userLevel.currentLevel.value,
      totalXp: userLevel.totalXp.value,
      xpInCurrentLevel: userLevel.getXpInCurrentLevel(),
      xpForNextLevel: userLevel.getXpForNextLevel(),
      progressToNextLevel: userLevel.getProgressToNextLevel(),
      isMaxLevel: userLevel.isMaxLevel(),
      currentStreak: userLevel.streak.currentStreak,
      isStreakActive: userLevel.streak.isActive(),
      streakBonus: userLevel.streak.getStreakBonus(),
    };
  }
}
