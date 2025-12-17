import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { ActivateClassCommand } from './activate-class.command';
import {
  IClassRepository,
  CLASS_REPOSITORY,
} from '@class-management/domain/repositories/class.repository.interface';
import { ClassId } from '@class-management/domain/value-objects/class-id.vo';
import { EventBusService } from '@shared/infrastructure/event-bus/event-bus.service';

@CommandHandler(ActivateClassCommand)
export class ActivateClassHandler implements ICommandHandler<ActivateClassCommand> {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private readonly classRepository: IClassRepository,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(command: ActivateClassCommand): Promise<void> {
    const classEntity = await this.classRepository.findById(
      ClassId.create(command.classId),
    );

    if (!classEntity) {
      throw new NotFoundException(`Class ${command.classId} not found`);
    }

    classEntity.activate();

    await this.classRepository.save(classEntity);

    for (const event of classEntity.clearEvents()) {
      await this.eventBus.publish(event);
    }
  }
}
