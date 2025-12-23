import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdatePaymentStatusCommand } from './update-payment-status.command';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';

@CommandHandler(UpdatePaymentStatusCommand)
export class UpdatePaymentStatusHandler implements ICommandHandler<UpdatePaymentStatusCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    command: UpdatePaymentStatusCommand,
  ): Promise<{ message: string }> {
    const enrollment = await this.prisma.classEnrollment.findUnique({
      where: { id: command.enrollmentId },
    });

    if (!enrollment) {
      throw new NotFoundException(
        `Enrollment ${command.enrollmentId} not found`,
      );
    }

    // Validate payment status
    const validStatuses: PaymentStatus[] = ['pending', 'verified', 'refunded'];
    if (!validStatuses.includes(command.paymentStatus as PaymentStatus)) {
      throw new BadRequestException(
        `Invalid payment status: ${command.paymentStatus}`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      // Update enrollment payment status
      await tx.classEnrollment.update({
        where: { id: command.enrollmentId },
        data: {
          paymentStatus: command.paymentStatus as PaymentStatus,
        },
      });

      // Create audit log via credit adjustment (with 0 adjustment)
      if (command.verificationNotes) {
        await tx.creditAdjustment.create({
          data: {
            enrollmentId: command.enrollmentId,
            adjustment: 0,
            creditsBefore: enrollment.meetingCredits,
            creditsAfter: enrollment.meetingCredits,
            reason: 'payment_status_change',
            reasonDetail: `Payment status changed to ${command.paymentStatus}: ${command.verificationNotes}`,
            adjustedById: command.verifiedById,
          },
        });
      }
    });

    return { message: 'Payment status updated successfully' };
  }
}
