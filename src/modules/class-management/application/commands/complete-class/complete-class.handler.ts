import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { CompleteClassCommand } from './complete-class.command';
import {
  IClassRepository,
  CLASS_REPOSITORY,
} from '@class-management/domain/repositories/class.repository.interface';
import { ClassId } from '@class-management/domain/value-objects/class-id.vo';
import { EventBusService } from '@shared/infrastructure/event-bus/event-bus.service';

@CommandHandler(CompleteClassCommand)
export class CompleteClassHandler implements ICommandHandler<CompleteClassCommand> {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private readonly classRepository: IClassRepository,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(command: CompleteClassCommand): Promise<void> {
    const classEntity = await this.classRepository.findById(
      ClassId.create(command.classId),
    );

    if (!classEntity) {
      throw new NotFoundException(`Class ${command.classId} not found`);
    }

    classEntity.complete();

    await this.classRepository.save(classEntity);

    for (const event of classEntity.clearEvents()) {
      await this.eventBus.publish(event);
    }
  }
}
