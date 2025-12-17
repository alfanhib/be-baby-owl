import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { MarkAttendanceCommand } from './mark-attendance.command';
import {
  IClassRepository,
  CLASS_REPOSITORY,
} from '@class-management/domain/repositories/class.repository.interface';
import { ClassId } from '@class-management/domain/value-objects/class-id.vo';
import { AttendanceStatus } from '@class-management/domain/value-objects/attendance-status.vo';
import { EventBusService } from '@shared/infrastructure/event-bus/event-bus.service';

@CommandHandler(MarkAttendanceCommand)
export class MarkAttendanceHandler implements ICommandHandler<MarkAttendanceCommand> {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private readonly classRepository: IClassRepository,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(
    command: MarkAttendanceCommand,
  ): Promise<{ attendanceId: string }> {
    const classEntity = await this.classRepository.findByIdWithEnrollments(
      ClassId.create(command.classId),
    );

    if (!classEntity) {
      throw new NotFoundException(`Class ${command.classId} not found`);
    }

    const status = AttendanceStatus.create(command.status);

    const attendance = classEntity.markAttendance(
      command.enrollmentId,
      command.meetingNumber,
      command.meetingDate,
      status,
      command.markedBy,
      command.notes,
    );

    await this.classRepository.save(classEntity);
    await this.classRepository.saveAttendance(attendance);

    for (const event of classEntity.clearEvents()) {
      await this.eventBus.publish(event);
    }

    return { attendanceId: attendance.id.value };
  }
}
