import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { EnrollStudentCommand } from './enroll-student.command';
import {
  IClassRepository,
  CLASS_REPOSITORY,
} from '@class-management/domain/repositories/class.repository.interface';
import { ClassId } from '@class-management/domain/value-objects/class-id.vo';
import { EventBusService } from '@shared/infrastructure/event-bus/event-bus.service';

@CommandHandler(EnrollStudentCommand)
export class EnrollStudentHandler implements ICommandHandler<EnrollStudentCommand> {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private readonly classRepository: IClassRepository,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(
    command: EnrollStudentCommand,
  ): Promise<{ enrollmentId: string }> {
    const classEntity = await this.classRepository.findByIdWithEnrollments(
      ClassId.create(command.classId),
    );

    if (!classEntity) {
      throw new NotFoundException(`Class ${command.classId} not found`);
    }

    const enrollment = classEntity.enrollStudent(
      command.studentId,
      command.notes,
    );

    await this.classRepository.save(classEntity);

    for (const event of classEntity.clearEvents()) {
      await this.eventBus.publish(event);
    }

    return { enrollmentId: enrollment.id.value };
  }
}
