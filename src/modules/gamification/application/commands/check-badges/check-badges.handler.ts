import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CheckBadgesCommand } from './check-badges.command';
import { AwardBadgeCommand } from '../award-badge/award-badge.command';
import {
  GAMIFICATION_REPOSITORY,
  GamificationRepositoryInterface,
} from '../../../domain';

@CommandHandler(CheckBadgesCommand)
export class CheckBadgesHandler implements ICommandHandler<CheckBadgesCommand> {
  constructor(
    @Inject(GAMIFICATION_REPOSITORY)
    private readonly repository: GamificationRepositoryInterface,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: CheckBadgesCommand): Promise<{
    newBadgesEarned: Array<{ badgeId: string; badgeName: string }>;
  }> {
    const { userId } = command;

    // Get user stats
    const userStats = await this.repository.getUserStats(userId);

    // Get all badges
    const allBadges = await this.repository.findAllBadges();

    // Get user's existing badges
    const userBadges = await this.repository.findUserBadgesByUserId(userId);
    const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId));

    // Check each badge's criteria
    const newBadgesEarned: Array<{ badgeId: string; badgeName: string }> = [];

    for (const badge of allBadges) {
      // Skip if already earned
      if (earnedBadgeIds.has(badge.id)) {
        continue;
      }

      // Check if criteria is met
      if (badge.checkCriteria(userStats)) {
        try {
          await this.commandBus.execute(
            new AwardBadgeCommand(userId, badge.id),
          );
          newBadgesEarned.push({
            badgeId: badge.id,
            badgeName: badge.name,
          });
        } catch {
          // Badge might have been awarded in another transaction
          continue;
        }
      }
    }

    return { newBadgesEarned };
  }
}
