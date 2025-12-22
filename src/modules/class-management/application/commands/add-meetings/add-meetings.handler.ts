import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AddMeetingsCommand } from './add-meetings.command';
import {
  IClassRepository,
  CLASS_REPOSITORY,
} from '../../../domain/repositories/class.repository.interface';
import { ClassId } from '../../../domain/value-objects/class-id.vo';

export interface AddMeetingsResult {
  classId: string;
  previousMeetings: number;
  newTotalMeetings: number;
  meetingsAdded: number;
}

@CommandHandler(AddMeetingsCommand)
export class AddMeetingsHandler implements ICommandHandler<
  AddMeetingsCommand,
  AddMeetingsResult
> {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private readonly classRepository: IClassRepository,
    private readonly eventBus: EventBus,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  async execute(command: AddMeetingsCommand): Promise<AddMeetingsResult> {
    const { classId, meetingsToAdd } = command;

    const classAggregate = await this.classRepository.findById(
      ClassId.create(classId),
    );
    if (!classAggregate) {
      throw new Error(`Class not found: ${classId}`);
    }

    // Only private classes can add meetings
    if (!classAggregate.type.isPrivate()) {
      throw new Error(
        'Cannot add meetings to group classes. Students must continue as private class.',
      );
    }

    const previousMeetings = classAggregate.totalMeetings;

    // Add meetings using domain method
    classAggregate.addMeetings(meetingsToAdd);

    // Save to repository
    await this.classRepository.save(classAggregate);

    // Publish domain events
    const events = classAggregate.clearEvents();
    events.forEach((event) => this.eventBus.publish(event));

    const newTotalMeetings: number = classAggregate.totalMeetings;
    const result: AddMeetingsResult = {
      classId,
      previousMeetings,
      newTotalMeetings,
      meetingsAdded: meetingsToAdd,
    };
    return result;
  }
}
