import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { Roles } from '@/shared/interfaces/decorators/roles.decorator';
import { CurrentUser } from '@/shared/interfaces/decorators/current-user.decorator';

import {
  AwardXpCommand,
  AwardBadgeCommand,
  UpdateStreakCommand,
  CheckBadgesCommand,
  GetUserLevelQuery,
  GetUserBadgesQuery,
  GetLeaderboardQuery,
  GetAvailableBadgesQuery,
  GetXpHistoryQuery,
  UserLevelResponse,
} from '../../../application';

import {
  AwardXpDto,
  AwardBadgeDto,
  LeaderboardQueryDto,
  XpHistoryQueryDto,
} from '../dto';

@ApiTags('Gamification')
@ApiBearerAuth()
@Controller('gamification')
export class GamificationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // ==================== User Level & XP ====================

  @Get('me/level')
  @ApiOperation({ summary: 'Get current user level and XP stats' })
  @ApiResponse({ status: 200, description: 'User level stats retrieved' })
  async getMyLevel(
    @CurrentUser() user: { userId: string },
  ): Promise<UserLevelResponse> {
    return this.queryBus.execute(new GetUserLevelQuery(user.userId));
  }

  @Get('users/:userId/level')
  @ApiOperation({ summary: 'Get user level by ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User level retrieved' })
  async getUserLevel(
    @Param('userId') userId: string,
  ): Promise<UserLevelResponse> {
    return this.queryBus.execute(new GetUserLevelQuery(userId));
  }

  @Get('me/xp-history')
  @ApiOperation({ summary: 'Get current user XP transaction history' })
  @ApiResponse({ status: 200, description: 'XP history retrieved' })
  async getMyXpHistory(
    @CurrentUser() user: { userId: string },
    @Query() query: XpHistoryQueryDto,
  ): Promise<unknown> {
    return this.queryBus.execute(
      new GetXpHistoryQuery(user.userId, query.limit, query.offset),
    );
  }

  @Post('xp/award')
  @Roles('staff', 'super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Award XP to a user (Admin only)' })
  @ApiResponse({ status: 200, description: 'XP awarded successfully' })
  async awardXp(@Body() dto: AwardXpDto): Promise<unknown> {
    return this.commandBus.execute(
      new AwardXpCommand(dto.userId, dto.amount, dto.reason, dto.referenceId),
    );
  }

  // ==================== Streak ====================

  @Post('me/streak')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record activity and update streak' })
  @ApiResponse({ status: 200, description: 'Streak updated' })
  async updateMyStreak(
    @CurrentUser() user: { userId: string },
  ): Promise<unknown> {
    return this.commandBus.execute(new UpdateStreakCommand(user.userId));
  }

  // ==================== Badges ====================

  @Get('me/badges')
  @ApiOperation({ summary: 'Get current user earned badges' })
  @ApiResponse({ status: 200, description: 'User badges retrieved' })
  async getMyBadges(@CurrentUser() user: { userId: string }): Promise<unknown> {
    return this.queryBus.execute(new GetUserBadgesQuery(user.userId));
  }

  @Get('users/:userId/badges')
  @ApiOperation({ summary: 'Get user badges by ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User badges retrieved' })
  async getUserBadges(@Param('userId') userId: string): Promise<unknown> {
    return this.queryBus.execute(new GetUserBadgesQuery(userId));
  }

  @Get('badges')
  @ApiOperation({ summary: 'Get all available badges with progress' })
  @ApiResponse({ status: 200, description: 'Available badges retrieved' })
  async getAvailableBadges(
    @CurrentUser() user: { userId: string },
  ): Promise<unknown> {
    return this.queryBus.execute(new GetAvailableBadgesQuery(user.userId));
  }

  @Post('badges/award')
  @Roles('staff', 'super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Award badge to a user (Admin only)' })
  @ApiResponse({ status: 200, description: 'Badge awarded successfully' })
  async awardBadge(@Body() dto: AwardBadgeDto): Promise<unknown> {
    return this.commandBus.execute(
      new AwardBadgeCommand(dto.userId, dto.badgeId),
    );
  }

  @Post('me/badges/check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check and award any earned badges' })
  @ApiResponse({ status: 200, description: 'Badges checked and awarded' })
  async checkMyBadges(
    @CurrentUser() user: { userId: string },
  ): Promise<unknown> {
    return this.commandBus.execute(new CheckBadgesCommand(user.userId));
  }

  // ==================== Leaderboard ====================

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get XP leaderboard' })
  @ApiResponse({ status: 200, description: 'Leaderboard retrieved' })
  async getLeaderboard(@Query() query: LeaderboardQueryDto): Promise<unknown> {
    return this.queryBus.execute(
      new GetLeaderboardQuery(
        query.limit,
        query.offset,
        query.period as 'daily' | 'weekly' | 'monthly' | 'all_time',
      ),
    );
  }
}
