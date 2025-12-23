import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { BulkUnlockLessonsCommand } from './bulk-unlock-lessons.command';
import {
  IClassRepository,
  CLASS_REPOSITORY,
} from '@class-management/domain/repositories/class.repository.interface';
import { ClassId } from '@class-management/domain/value-objects/class-id.vo';

export interface BulkUnlockResult {
  successful: { lessonId: string; lessonUnlockId: string }[];
  failed: { lessonId: string; error: string }[];
}

@CommandHandler(BulkUnlockLessonsCommand)
export class BulkUnlockLessonsHandler implements ICommandHandler<BulkUnlockLessonsCommand> {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private readonly classRepository: IClassRepository,
  ) {}

  async execute(command: BulkUnlockLessonsCommand): Promise<BulkUnlockResult> {
    const classEntity = await this.classRepository.findById(
      ClassId.create(command.classId),
    );

    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    const result: BulkUnlockResult = {
      successful: [],
      failed: [],
    };

    for (const item of command.lessons) {
      try {
        const unlock = classEntity.unlockLesson(
          item.lessonId,
          command.unlockedBy,
          item.meetingNumber,
          item.notes,
        );
        result.successful.push({
          lessonId: item.lessonId,
          lessonUnlockId: unlock.id.value,
        });
      } catch (error) {
        result.failed.push({
          lessonId: item.lessonId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Save class with all unlocks
    await this.classRepository.save(classEntity);

    return result;
  }
}
