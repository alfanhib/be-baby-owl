import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdateEnrollmentStatusCommand } from './update-enrollment-status.command';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { EnrollmentStatus } from '@prisma/client';

@CommandHandler(UpdateEnrollmentStatusCommand)
export class UpdateEnrollmentStatusHandler implements ICommandHandler<UpdateEnrollmentStatusCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    command: UpdateEnrollmentStatusCommand,
  ): Promise<{ message: string }> {
    const enrollment = await this.prisma.classEnrollment.findUnique({
      where: { id: command.enrollmentId },
    });

    if (!enrollment) {
      throw new NotFoundException(
        `Enrollment ${command.enrollmentId} not found`,
      );
    }

    // Validate status transition
    const validStatuses: EnrollmentStatus[] = [
      'active',
      'completed',
      'withdrawn',
    ];
    if (!validStatuses.includes(command.status as EnrollmentStatus)) {
      throw new BadRequestException(`Invalid status: ${command.status}`);
    }

    await this.prisma.classEnrollment.update({
      where: { id: command.enrollmentId },
      data: {
        status: command.status as EnrollmentStatus,
        completedAt:
          command.status === 'completed' ? new Date() : enrollment.completedAt,
      },
    });

    return { message: 'Enrollment status updated successfully' };
  }
}
