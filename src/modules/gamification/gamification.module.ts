import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { PrismaModule } from '@/shared/infrastructure/prisma/prisma.module';

import { GAMIFICATION_REPOSITORY } from './domain';
import { GamificationRepository } from './infrastructure';
import { GamificationController } from './interfaces';

// Command Handlers
import {
  AwardXpHandler,
  AwardBadgeHandler,
  UpdateStreakHandler,
  CheckBadgesHandler,
} from './application/commands';

// Query Handlers
import {
  GetUserLevelHandler,
  GetUserBadgesHandler,
  GetLeaderboardHandler,
  GetAvailableBadgesHandler,
  GetXpHistoryHandler,
} from './application/queries';

const CommandHandlers = [
  AwardXpHandler,
  AwardBadgeHandler,
  UpdateStreakHandler,
  CheckBadgesHandler,
];

const QueryHandlers = [
  GetUserLevelHandler,
  GetUserBadgesHandler,
  GetLeaderboardHandler,
  GetAvailableBadgesHandler,
  GetXpHistoryHandler,
];

@Module({
  imports: [CqrsModule, PrismaModule],
  controllers: [GamificationController],
  providers: [
    // Repository
    {
      provide: GAMIFICATION_REPOSITORY,
      useClass: GamificationRepository,
    },
    // Handlers
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [GAMIFICATION_REPOSITORY],
})
export class GamificationModule {}
