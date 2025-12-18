import {
  CommandHandler,
  ICommandHandler,
  EventBus,
  CommandBus,
} from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AwardBadgeCommand } from './award-badge.command';
import { AwardXpCommand } from '../award-xp/award-xp.command';
import {
  GAMIFICATION_REPOSITORY,
  GamificationRepositoryInterface,
  UserBadge,
  BadgeNotFoundError,
  BadgeAlreadyEarnedError,
  BadgeEarnedEvent,
} from '../../../domain';

@CommandHandler(AwardBadgeCommand)
export class AwardBadgeHandler implements ICommandHandler<AwardBadgeCommand> {
  constructor(
    @Inject(GAMIFICATION_REPOSITORY)
    private readonly repository: GamificationRepositoryInterface,
    private readonly eventBus: EventBus,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: AwardBadgeCommand): Promise<{
    badgeId: string;
    badgeName: string;
    xpBonus: number;
  }> {
    const { userId, badgeId } = command;

    // Check if badge exists
    const badge = await this.repository.findBadgeById(badgeId);
    if (!badge) {
      throw new BadgeNotFoundError(badgeId);
    }

    // Check if user already has this badge
    const existingUserBadge = await this.repository.findUserBadge(
      userId,
      badgeId,
    );
    if (existingUserBadge) {
      throw new BadgeAlreadyEarnedError(userId, badgeId);
    }

    // Create user badge
    const userBadge = UserBadge.create({ userId, badgeId });
    await this.repository.createUserBadge(userBadge);

    // Award XP bonus for earning badge
    const xpBonus = badge.rarity.getXpBonus();
    if (xpBonus > 0) {
      await this.commandBus.execute(
        new AwardXpCommand(userId, xpBonus, 'badge_earned', badgeId),
      );
    }

    // Publish badge earned event
    this.eventBus.publish(
      new BadgeEarnedEvent({
        userId,
        badgeId,
        badgeName: badge.name,
        badgeRarity: badge.rarity.value,
      }),
    );

    return {
      badgeId,
      badgeName: badge.name,
      xpBonus,
    };
  }
}
