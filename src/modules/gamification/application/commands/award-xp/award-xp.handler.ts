import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AwardXpCommand } from './award-xp.command';
import {
  GAMIFICATION_REPOSITORY,
  GamificationRepositoryInterface,
  UserLevel,
  XpTransaction,
} from '../../../domain';

@CommandHandler(AwardXpCommand)
export class AwardXpHandler implements ICommandHandler<AwardXpCommand> {
  constructor(
    @Inject(GAMIFICATION_REPOSITORY)
    private readonly repository: GamificationRepositoryInterface,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: AwardXpCommand): Promise<{
    xpAwarded: number;
    newTotalXp: number;
    newLevel: number;
    leveledUp: boolean;
  }> {
    const { userId, amount, reason, referenceId } = command;

    // Get or create user level
    let userLevel = await this.repository.findUserLevelByUserId(userId);
    const previousLevel = userLevel?.currentLevel.value ?? 1;

    if (!userLevel) {
      userLevel = UserLevel.create(userId);
      await this.repository.createUserLevel(userLevel);
    }

    // Add XP to user level (this will emit domain events)
    userLevel.addXp(amount, reason, referenceId);

    // Record activity for streak
    userLevel.recordActivity();

    // Save user level
    await this.repository.saveUserLevel(userLevel);

    // Create XP transaction record
    const transaction = XpTransaction.create({
      userId,
      amount,
      reason,
      referenceId,
    });
    await this.repository.createXpTransaction(transaction);

    // Publish domain events
    const events = userLevel.clearEvents();
    for (const event of events) {
      this.eventBus.publish(event);
    }

    return {
      xpAwarded: amount,
      newTotalXp: userLevel.totalXp.value,
      newLevel: userLevel.currentLevel.value,
      leveledUp: userLevel.currentLevel.value > previousLevel,
    };
  }
}
