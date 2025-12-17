import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateClassCommand } from './update-class.command';
import {
  IClassRepository,
  CLASS_REPOSITORY,
} from '@class-management/domain/repositories/class.repository.interface';
import { ClassId } from '@class-management/domain/value-objects/class-id.vo';

@CommandHandler(UpdateClassCommand)
export class UpdateClassHandler implements ICommandHandler<UpdateClassCommand> {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private readonly classRepository: IClassRepository,
  ) {}

  async execute(command: UpdateClassCommand): Promise<void> {
    const classEntity = await this.classRepository.findById(
      ClassId.create(command.classId),
    );

    if (!classEntity) {
      throw new NotFoundException(`Class ${command.classId} not found`);
    }

    classEntity.updateDetails({
      name: command.name,
      maxStudents: command.maxStudents,
      startDate: command.startDate,
      endDate: command.endDate,
      enrollmentDeadline: command.enrollmentDeadline,
      notes: command.notes,
    });

    await this.classRepository.save(classEntity);
  }
}
