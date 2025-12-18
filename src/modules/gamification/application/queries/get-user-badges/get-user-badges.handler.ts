import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUserBadgesQuery } from './get-user-badges.query';
import {
  GAMIFICATION_REPOSITORY,
  GamificationRepositoryInterface,
} from '../../../domain';

export interface UserBadgeResponse {
  badgeId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  rarity: string;
  earnedAt: Date;
}

@QueryHandler(GetUserBadgesQuery)
export class GetUserBadgesHandler implements IQueryHandler<GetUserBadgesQuery> {
  constructor(
    @Inject(GAMIFICATION_REPOSITORY)
    private readonly repository: GamificationRepositoryInterface,
  ) {}

  async execute(query: GetUserBadgesQuery): Promise<{
    badges: UserBadgeResponse[];
    totalCount: number;
  }> {
    const { userId } = query;

    const userBadges = await this.repository.findUserBadgesByUserId(userId);
    const allBadges = await this.repository.findAllBadges();

    // Create a map of badges for quick lookup
    const badgeMap = new Map(allBadges.map((b) => [b.id, b]));

    const badges: UserBadgeResponse[] = [];

    for (const ub of userBadges) {
      const badge = badgeMap.get(ub.badgeId);
      if (badge) {
        badges.push({
          badgeId: badge.id,
          name: badge.name,
          description: badge.description,
          imageUrl: badge.imageUrl,
          rarity: badge.rarity.value,
          earnedAt: ub.earnedAt,
        });
      }
    }

    return {
      badges,
      totalCount: badges.length,
    };
  }
}
