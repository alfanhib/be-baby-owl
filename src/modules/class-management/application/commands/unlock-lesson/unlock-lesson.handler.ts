import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UnlockLessonCommand } from './unlock-lesson.command';
import {
  IClassRepository,
  CLASS_REPOSITORY,
} from '@class-management/domain/repositories/class.repository.interface';
import { ClassId } from '@class-management/domain/value-objects/class-id.vo';
import { EventBusService } from '@shared/infrastructure/event-bus/event-bus.service';

@CommandHandler(UnlockLessonCommand)
export class UnlockLessonHandler implements ICommandHandler<UnlockLessonCommand> {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private readonly classRepository: IClassRepository,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(
    command: UnlockLessonCommand,
  ): Promise<{ lessonUnlockId: string }> {
    const classEntity = await this.classRepository.findById(
      ClassId.create(command.classId),
    );

    if (!classEntity) {
      throw new NotFoundException(`Class ${command.classId} not found`);
    }

    const unlock = classEntity.unlockLesson(
      command.lessonId,
      command.unlockedBy,
      command.meetingNumber,
      command.notes,
    );

    await this.classRepository.save(classEntity);

    for (const event of classEntity.clearEvents()) {
      await this.eventBus.publish(event);
    }

    return { lessonUnlockId: unlock.id.value };
  }
}
