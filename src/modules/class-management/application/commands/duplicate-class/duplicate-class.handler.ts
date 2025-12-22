import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DuplicateClassCommand } from './duplicate-class.command';
import {
  IClassRepository,
  CLASS_REPOSITORY,
} from '@class-management/domain/repositories/class.repository.interface';
import { Class } from '@class-management/domain/aggregates/class.aggregate';
import { ClassId } from '@class-management/domain/value-objects/class-id.vo';

@CommandHandler(DuplicateClassCommand)
export class DuplicateClassHandler
  implements ICommandHandler<DuplicateClassCommand>
{
  constructor(
    @Inject(CLASS_REPOSITORY)
    private readonly classRepository: IClassRepository,
  ) {}

  async execute(
    command: DuplicateClassCommand,
  ): Promise<{ classId: string }> {
    const sourceClass = await this.classRepository.findById(
      ClassId.create(command.sourceClassId),
    );

    if (!sourceClass) {
      throw new NotFoundException('Source class not found');
    }

    // Create new class based on source, but without enrollments/unlocks
    const newClass = Class.create({
      name: command.newName,
      courseId: sourceClass.courseId,
      instructorId: command.newInstructorId ?? sourceClass.instructorId,
      type: sourceClass.type.value,
      totalMeetings: sourceClass.totalMeetings,
      maxStudents: sourceClass.maxStudents,
      schedules: sourceClass.schedules.map((s) => ({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        timezone: s.timezone,
      })),
      startDate: command.newStartDate,
      endDate: command.newEndDate,
      enrollmentDeadline: command.newEnrollmentDeadline,
      notes: sourceClass.notes,
    });

    await this.classRepository.save(newClass);

    return { classId: newClass.id.value };
  }
}


