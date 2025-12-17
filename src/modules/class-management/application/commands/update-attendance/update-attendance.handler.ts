import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdateAttendanceCommand } from './update-attendance.command';
import {
  IClassRepository,
  CLASS_REPOSITORY,
} from '@class-management/domain/repositories/class.repository.interface';
import { AttendanceStatus } from '@class-management/domain/value-objects/attendance-status.vo';
import { EventBusService } from '@shared/infrastructure/event-bus/event-bus.service';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

@CommandHandler(UpdateAttendanceCommand)
export class UpdateAttendanceHandler implements ICommandHandler<UpdateAttendanceCommand> {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private readonly classRepository: IClassRepository,
    private readonly eventBus: EventBusService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: UpdateAttendanceCommand): Promise<void> {
    // Find existing attendance record
    const attendance = await this.classRepository.findAttendanceById(
      command.attendanceId,
    );

    if (!attendance) {
      throw new NotFoundException(
        `Attendance record ${command.attendanceId} not found`,
      );
    }

    // Create new status
    let newStatus: AttendanceStatus;
    try {
      newStatus = AttendanceStatus.create(command.status);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Invalid attendance status',
      );
    }

    // Update status and get credit delta
    const { creditDelta } = attendance.updateStatus(
      newStatus,
      command.editedBy,
      command.notes,
    );

    // If credit changed, update the enrollment
    if (creditDelta !== 0) {
      await this.prisma.$transaction(async (tx) => {
        // Update attendance
        await tx.classAttendance.update({
          where: { id: attendance.id.value },
          data: {
            status: newStatus.value as 'present' | 'absent' | 'late',
            creditDeducted: attendance.creditConsumed,
            updatedById: command.editedBy,
            updatedAt: new Date(),
            notes: command.notes ?? attendance.notes,
          },
        });

        // Update enrollment credits
        await tx.classEnrollment.update({
          where: { id: attendance.enrollmentId },
          data: {
            creditsUsed: {
              increment: creditDelta > 0 ? -1 : 1, // If creditDelta is +1 (refund), decrement creditsUsed
            },
          },
        });
      });
    } else {
      // Just update the attendance record
      await this.classRepository.saveAttendance(attendance);
    }
  }
}
