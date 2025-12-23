import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

export interface CreateNotificationDto {
  userId: string;
  type: string;
  title: string;
  message?: string;
  referenceId?: string;
}

export interface NotificationDto {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string | null;
  read: boolean;
  referenceId: string | null;
  createdAt: Date;
}

export interface PaginatedNotifications {
  data: NotificationDto[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateNotificationDto): Promise<NotificationDto> {
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        referenceId: dto.referenceId,
      },
    });

    this.logger.log(`Notification created: ${dto.type} for user ${dto.userId}`);

    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      read: notification.read,
      referenceId: notification.referenceId,
      createdAt: notification.createdAt,
    };
  }

  async createMany(notifications: CreateNotificationDto[]): Promise<number> {
    const result = await this.prisma.notification.createMany({
      data: notifications.map((n) => ({
        userId: n.userId,
        type: n.type,
        title: n.title,
        message: n.message,
        referenceId: n.referenceId,
      })),
    });

    this.logger.log(`${result.count} notifications created`);
    return result.count;
  }

  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedNotifications> {
    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, read: false } }),
    ]);

    return {
      data: notifications.map((n) => ({
        id: n.id,
        userId: n.userId,
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read,
        referenceId: n.referenceId,
        createdAt: n.createdAt,
      })),
      total,
      unreadCount,
      page,
      limit,
    };
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return result.count;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, read: false },
    });
  }

  async delete(notificationId: string, userId: string): Promise<void> {
    await this.prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    });
  }

  async deleteOld(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.prisma.notification.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        read: true,
      },
    });

    this.logger.log(`Deleted ${result.count} old notifications`);
    return result.count;
  }

  // ========== Notification Type Helpers ==========

  async notifyLessonUnlocked(
    userId: string,
    lessonTitle: string,
    courseTitle: string,
    lessonId: string,
  ): Promise<NotificationDto> {
    return this.create({
      userId,
      type: 'lesson_unlocked',
      title: 'New Lesson Unlocked!',
      message: `"${lessonTitle}" in ${courseTitle} is now available`,
      referenceId: lessonId,
    });
  }

  async notifyAssignmentGraded(
    userId: string,
    exerciseTitle: string,
    score: number,
    maxScore: number,
    submissionId: string,
  ): Promise<NotificationDto> {
    const percentage = Math.round((score / maxScore) * 100);
    return this.create({
      userId,
      type: 'assignment_graded',
      title: 'Assignment Graded',
      message: `Your submission for "${exerciseTitle}" received ${score}/${maxScore} (${percentage}%)`,
      referenceId: submissionId,
    });
  }

  async notifyPaymentVerified(
    userId: string,
    courseTitle: string,
    paymentId: string,
  ): Promise<NotificationDto> {
    return this.create({
      userId,
      type: 'payment_verified',
      title: 'Payment Confirmed',
      message: `Your payment for "${courseTitle}" has been verified`,
      referenceId: paymentId,
    });
  }

  async notifyEnrollmentConfirmed(
    userId: string,
    className: string,
    enrollmentId: string,
  ): Promise<NotificationDto> {
    return this.create({
      userId,
      type: 'enrollment_confirmed',
      title: 'Enrollment Confirmed',
      message: `You have been enrolled in "${className}"`,
      referenceId: enrollmentId,
    });
  }

  async notifySubmissionReturned(
    userId: string,
    exerciseTitle: string,
    feedback: string,
    submissionId: string,
  ): Promise<NotificationDto> {
    return this.create({
      userId,
      type: 'submission_returned',
      title: 'Revision Requested',
      message: `Your submission for "${exerciseTitle}" needs revision: ${feedback.substring(0, 100)}...`,
      referenceId: submissionId,
    });
  }
}
