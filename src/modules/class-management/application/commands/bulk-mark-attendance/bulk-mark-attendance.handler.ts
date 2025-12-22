import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { BulkMarkAttendanceCommand } from './bulk-mark-attendance.command';
import {
  IClassRepository,
  CLASS_REPOSITORY,
} from '@class-management/domain/repositories/class.repository.interface';
import { ClassId } from '@class-management/domain/value-objects/class-id.vo';
import { AttendanceStatus } from '@class-management/domain/value-objects/attendance-status.vo';

export interface BulkAttendanceResult {
  successful: { enrollmentId: string; attendanceId: string }[];
  failed: { enrollmentId: string; error: string }[];
}

@CommandHandler(BulkMarkAttendanceCommand)
export class BulkMarkAttendanceHandler
  implements ICommandHandler<BulkMarkAttendanceCommand>
{
  constructor(
    @Inject(CLASS_REPOSITORY)
    private readonly classRepository: IClassRepository,
  ) {}

  async execute(
    command: BulkMarkAttendanceCommand,
  ): Promise<BulkAttendanceResult> {
    const classEntity = await this.classRepository.findById(
      ClassId.create(command.classId),
    );

    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    const result: BulkAttendanceResult = {
      successful: [],
      failed: [],
    };

    for (const item of command.attendances) {
      try {
        const status = AttendanceStatus.create(item.status);
        const attendance = classEntity.markAttendance(
          item.enrollmentId,
          command.meetingNumber,
          command.meetingDate,
          status,
          command.markedBy,
          item.notes,
        );
        result.successful.push({
          enrollmentId: item.enrollmentId,
          attendanceId: attendance.id.value,
        });
      } catch (error) {
        result.failed.push({
          enrollmentId: item.enrollmentId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Save class with all attendance records
    await this.classRepository.save(classEntity);

    return result;
  }
}


