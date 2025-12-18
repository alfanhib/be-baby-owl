import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateStreakCommand } from './update-streak.command';
import {
  GAMIFICATION_REPOSITORY,
  GamificationRepositoryInterface,
  UserLevel,
} from '../../../domain';

@CommandHandler(UpdateStreakCommand)
export class UpdateStreakHandler implements ICommandHandler<UpdateStreakCommand> {
  constructor(
    @Inject(GAMIFICATION_REPOSITORY)
    private readonly repository: GamificationRepositoryInterface,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateStreakCommand): Promise<{
    currentStreak: number;
    isActive: boolean;
    streakBonus: number;
  }> {
    const { userId } = command;

    // Get or create user level
    let userLevel = await this.repository.findUserLevelByUserId(userId);

    if (!userLevel) {
      userLevel = UserLevel.create(userId);
      await this.repository.createUserLevel(userLevel);
    }

    // Record activity
    userLevel.recordActivity();

    // Save user level
    await this.repository.saveUserLevel(userLevel);

    // Publish domain events
    const events = userLevel.clearEvents();
    for (const event of events) {
      this.eventBus.publish(event);
    }

    return {
      currentStreak: userLevel.streak.currentStreak,
      isActive: userLevel.streak.isActive(),
      streakBonus: userLevel.streak.getStreakBonus(),
    };
  }
}
