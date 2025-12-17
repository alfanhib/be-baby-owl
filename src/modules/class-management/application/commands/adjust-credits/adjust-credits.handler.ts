import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { AdjustCreditsCommand } from './adjust-credits.command';
import {
  IClassRepository,
  CLASS_REPOSITORY,
} from '@class-management/domain/repositories/class.repository.interface';
import { ClassId } from '@class-management/domain/value-objects/class-id.vo';
import { CreditAdjustmentType } from '@class-management/domain/entities/credit-adjustment.entity';
import { EventBusService } from '@shared/infrastructure/event-bus/event-bus.service';

@CommandHandler(AdjustCreditsCommand)
export class AdjustCreditsHandler implements ICommandHandler<AdjustCreditsCommand> {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private readonly classRepository: IClassRepository,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(
    command: AdjustCreditsCommand,
  ): Promise<{ adjustmentId: string }> {
    const classEntity = await this.classRepository.findByIdWithEnrollments(
      ClassId.create(command.classId),
    );

    if (!classEntity) {
      throw new NotFoundException(`Class ${command.classId} not found`);
    }

    const adjustment = classEntity.adjustCredits(
      command.enrollmentId,
      command.amount,
      command.type as CreditAdjustmentType,
      command.reason,
      command.adjustedBy,
    );

    await this.classRepository.save(classEntity);
    await this.classRepository.saveCreditAdjustment(adjustment);

    for (const event of classEntity.clearEvents()) {
      await this.eventBus.publish(event);
    }

    return { adjustmentId: adjustment.id.value };
  }
}
