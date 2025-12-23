import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UpgradePackageCommand } from './upgrade-package.command';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { ClassType, PaymentStatus } from '@prisma/client';

export interface UpgradePackageResult {
  enrollmentId: string;
  classPackage: {
    totalMeetings: number;
    lessonsLimit: number;
  };
  credits: {
    total: number;
    used: number;
    remaining: number;
  };
  upgradeHistory: {
    fromMeetings: number;
    toMeetings: number;
    priceDifference: number;
    upgradedAt: Date;
    upgradedBy: string;
  }[];
}

@CommandHandler(UpgradePackageCommand)
export class UpgradePackageHandler implements ICommandHandler<UpgradePackageCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpgradePackageCommand): Promise<UpgradePackageResult> {
    // Find enrollment with class info
    const enrollment = await this.prisma.classEnrollment.findUnique({
      where: { id: command.enrollmentId },
      include: {
        class: true,
      },
    });

    if (!enrollment) {
      throw new NotFoundException(
        `Enrollment ${command.enrollmentId} not found`,
      );
    }

    // Only private classes can upgrade
    if (enrollment.class.type !== ClassType.private) {
      throw new BadRequestException(
        'Package upgrade is only available for private classes',
      );
    }

    // Validate payment status
    const validStatuses: PaymentStatus[] = ['pending', 'verified'];
    if (!validStatuses.includes(command.paymentStatus as PaymentStatus)) {
      throw new BadRequestException(
        `Invalid payment status: ${command.paymentStatus}`,
      );
    }

    const previousMeetings = enrollment.meetingCredits;
    const newMeetings = previousMeetings + command.additionalMeetings;

    // Get upgrader info for audit
    const upgrader = await this.prisma.user.findUnique({
      where: { id: command.upgradedById },
      select: { fullName: true },
    });

    // Perform upgrade in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Update enrollment credits
      await tx.classEnrollment.update({
        where: { id: command.enrollmentId },
        data: {
          meetingCredits: newMeetings,
          paymentAmount: {
            increment: command.additionalAmount,
          },
          paymentStatus: command.paymentStatus as PaymentStatus,
        },
      });

      // Update class total meetings (for private, it tracks the package)
      await tx.class.update({
        where: { id: enrollment.classId },
        data: {
          totalMeetings: {
            increment: command.additionalMeetings,
          },
        },
      });

      // Create credit adjustment record for audit
      await tx.creditAdjustment.create({
        data: {
          enrollmentId: command.enrollmentId,
          adjustment: command.additionalMeetings,
          creditsBefore: previousMeetings,
          creditsAfter: newMeetings,
          reason: 'package_upgrade',
          reasonDetail: `Upgraded from ${previousMeetings} to ${newMeetings} meetings. Additional payment: ${command.additionalAmount}`,
          adjustedById: command.upgradedById,
        },
      });

      return {
        enrollmentId: command.enrollmentId,
        classPackage: {
          totalMeetings: newMeetings,
          lessonsLimit: newMeetings,
        },
        credits: {
          total: newMeetings,
          used: enrollment.creditsUsed,
          remaining: newMeetings - enrollment.creditsUsed,
        },
        upgradeHistory: [
          {
            fromMeetings: previousMeetings,
            toMeetings: newMeetings,
            priceDifference: command.additionalAmount,
            upgradedAt: new Date(),
            upgradedBy: upgrader?.fullName || 'Unknown',
          },
        ],
      };
    });

    return result;
  }
}
