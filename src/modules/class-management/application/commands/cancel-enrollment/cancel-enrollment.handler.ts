import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CancelEnrollmentCommand } from './cancel-enrollment.command';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { EnrollmentStatus } from '@prisma/client';

interface CancelResult {
  enrollmentId: string;
  status: string;
  refundAmount: number | null;
}

@CommandHandler(CancelEnrollmentCommand)
export class CancelEnrollmentHandler implements ICommandHandler<CancelEnrollmentCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CancelEnrollmentCommand): Promise<CancelResult> {
    // Find enrollment
    const enrollment = await this.prisma.classEnrollment.findUnique({
      where: { id: command.enrollmentId },
      include: { class: true },
    });

    if (!enrollment) {
      throw new NotFoundException(
        `Enrollment ${command.enrollmentId} not found`,
      );
    }

    // Check if can be cancelled
    if (enrollment.status === EnrollmentStatus.completed) {
      throw new BadRequestException('Cannot cancel a completed enrollment');
    }

    if (enrollment.status === EnrollmentStatus.withdrawn) {
      throw new BadRequestException('Enrollment is already cancelled');
    }

    // Perform cancellation in transaction
    await this.prisma.$transaction(async (tx) => {
      // Update enrollment status
      await tx.classEnrollment.update({
        where: { id: command.enrollmentId },
        data: { status: EnrollmentStatus.withdrawn },
      });

      // Update class capacity
      await tx.class.update({
        where: { id: enrollment.classId },
        data: { currentCapacity: { decrement: 1 } },
      });

      // Create cancellation audit log
      await tx.creditAdjustment.create({
        data: {
          enrollmentId: command.enrollmentId,
          adjustment: -enrollment.meetingCredits + enrollment.creditsUsed,
          creditsBefore: enrollment.meetingCredits,
          creditsAfter: 0,
          reason: 'cancellation',
          reasonDetail: `Enrollment cancelled: ${command.reason}${command.refundAmount ? `. Refund: Rp ${command.refundAmount.toLocaleString('id-ID')}` : ''}`,
          adjustedById: command.cancelledById,
        },
      });
    });

    return {
      enrollmentId: command.enrollmentId,
      status: 'withdrawn',
      refundAmount: command.refundAmount,
    };
  }
}
