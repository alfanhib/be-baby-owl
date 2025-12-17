import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { CancelClassCommand } from './cancel-class.command';
import {
  IClassRepository,
  CLASS_REPOSITORY,
} from '@class-management/domain/repositories/class.repository.interface';
import { ClassId } from '@class-management/domain/value-objects/class-id.vo';
import { EventBusService } from '@shared/infrastructure/event-bus/event-bus.service';

@CommandHandler(CancelClassCommand)
export class CancelClassHandler implements ICommandHandler<CancelClassCommand> {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private readonly classRepository: IClassRepository,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(command: CancelClassCommand): Promise<void> {
    const classEntity = await this.classRepository.findById(
      ClassId.create(command.classId),
    );

    if (!classEntity) {
      throw new NotFoundException(`Class ${command.classId} not found`);
    }

    try {
      classEntity.cancel();
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Cannot cancel class',
      );
    }

    await this.classRepository.save(classEntity);

    for (const event of classEntity.clearEvents()) {
      await this.eventBus.publish(event);
    }
  }
}
