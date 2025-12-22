import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@shared/interfaces/guards/jwt-auth.guard';
import { RolesGuard } from '@shared/interfaces/guards/roles.guard';
import { Roles } from '@shared/interfaces/decorators/roles.decorator';
import { CurrentUser } from '@shared/interfaces/decorators/current-user.decorator';
import {
  NotificationService,
  PaginatedNotifications,
} from '../../in-app/notification.service';

interface CurrentUserPayload {
  userId: string;
  email: string;
  role: string;
}

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @Roles('student', 'instructor', 'staff', 'super_admin')
  @ApiOperation({ summary: 'Get my notifications' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Notifications list' })
  async getMyNotifications(
    @CurrentUser() user: CurrentUserPayload,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<PaginatedNotifications> {
    return this.notificationService.getUserNotifications(user.userId, page, limit);
  }

  @Get('unread-count')
  @Roles('student', 'instructor', 'staff', 'super_admin')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200, description: 'Unread count' })
  async getUnreadCount(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ count: number }> {
    const count = await this.notificationService.getUnreadCount(user.userId);
    return { count };
  }

  @Put(':notificationId/read')
  @Roles('student', 'instructor', 'staff', 'super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'notificationId' })
  @ApiResponse({ status: 200, description: 'Marked as read' })
  async markAsRead(
    @Param('notificationId') notificationId: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ message: string }> {
    await this.notificationService.markAsRead(notificationId, user.userId);
    return { message: 'Notification marked as read' };
  }

  @Put('mark-all-read')
  @Roles('student', 'instructor', 'staff', 'super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All marked as read' })
  async markAllAsRead(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ count: number }> {
    const count = await this.notificationService.markAllAsRead(user.userId);
    return { count };
  }

  @Delete(':notificationId')
  @Roles('student', 'instructor', 'staff', 'super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'notificationId' })
  @ApiResponse({ status: 200, description: 'Notification deleted' })
  async deleteNotification(
    @Param('notificationId') notificationId: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ message: string }> {
    await this.notificationService.delete(notificationId, user.userId);
    return { message: 'Notification deleted' };
  }
}

