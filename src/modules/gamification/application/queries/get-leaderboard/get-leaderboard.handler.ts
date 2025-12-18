import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetLeaderboardQuery } from './get-leaderboard.query';
import {
  GAMIFICATION_REPOSITORY,
  GamificationRepositoryInterface,
} from '../../../domain';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  fullName: string;
  avatar: string | null;
  totalXp: number;
  level: number;
}

@QueryHandler(GetLeaderboardQuery)
export class GetLeaderboardHandler implements IQueryHandler<GetLeaderboardQuery> {
  constructor(
    @Inject(GAMIFICATION_REPOSITORY)
    private readonly repository: GamificationRepositoryInterface,
  ) {}

  async execute(query: GetLeaderboardQuery): Promise<{
    entries: LeaderboardEntry[];
    period: string;
  }> {
    const { limit, offset, period } = query;

    const entries = await this.repository.getLeaderboard({
      limit,
      offset,
      period,
    });

    return {
      entries,
      period,
    };
  }
}
