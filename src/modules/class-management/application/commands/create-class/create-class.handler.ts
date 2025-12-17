import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateClassCommand } from './create-class.command';
import {
  IClassRepository,
  CLASS_REPOSITORY,
} from '@class-management/domain/repositories/class.repository.interface';
import { Class } from '@class-management/domain/aggregates/class.aggregate';
import { EventBusService } from '@shared/infrastructure/event-bus/event-bus.service';

@CommandHandler(CreateClassCommand)
export class CreateClassHandler implements ICommandHandler<CreateClassCommand> {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private readonly classRepository: IClassRepository,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(command: CreateClassCommand): Promise<{ classId: string }> {
    const classEntity = Class.create({
      name: command.name,
      courseId: command.courseId,
      instructorId: command.instructorId,
      type: command.type,
      totalMeetings: command.totalMeetings,
      maxStudents: command.maxStudents,
      schedules: command.schedules,
      startDate: command.startDate,
      endDate: command.endDate,
      enrollmentDeadline: command.enrollmentDeadline,
      notes: command.notes,
    });

    await this.classRepository.save(classEntity);

    // Publish domain events
    for (const event of classEntity.clearEvents()) {
      await this.eventBus.publish(event);
    }

    return { classId: classEntity.id.value };
  }
}
