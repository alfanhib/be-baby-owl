import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { OpenEnrollmentCommand } from './open-enrollment.command';
import {
  IClassRepository,
  CLASS_REPOSITORY,
} from '@class-management/domain/repositories/class.repository.interface';
import { ClassId } from '@class-management/domain/value-objects/class-id.vo';

@CommandHandler(OpenEnrollmentCommand)
export class OpenEnrollmentHandler implements ICommandHandler<OpenEnrollmentCommand> {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private readonly classRepository: IClassRepository,
  ) {}

  async execute(command: OpenEnrollmentCommand): Promise<void> {
    const classEntity = await this.classRepository.findById(
      ClassId.create(command.classId),
    );

    if (!classEntity) {
      throw new NotFoundException(`Class ${command.classId} not found`);
    }

    classEntity.openEnrollment();

    await this.classRepository.save(classEntity);
  }
}
