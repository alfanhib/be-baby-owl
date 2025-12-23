import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ContinueAsPrivateCommand } from './continue-as-private.command';
import {
  IClassRepository,
  CLASS_REPOSITORY,
} from '../../../domain/repositories/class.repository.interface';
import { Class } from '../../../domain/aggregates/class.aggregate';
import { ClassId } from '../../../domain/value-objects/class-id.vo';

export interface ContinueAsPrivateResult {
  newClassId: string;
  sourceClassId: string;
  studentId: string;
  courseId: string;
  packageMeetings: number;
  lessonsRemaining: number;
}

@CommandHandler(ContinueAsPrivateCommand)
export class ContinueAsPrivateHandler implements ICommandHandler<
  ContinueAsPrivateCommand,
  ContinueAsPrivateResult
> {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private readonly classRepository: IClassRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(
    command: ContinueAsPrivateCommand,
  ): Promise<ContinueAsPrivateResult> {
    const {
      sourceClassId,
      studentId,
      packageMeetings,
      instructorId,
      schedules,
    } = command;

    // 1. Get source class
    const sourceClass = await this.classRepository.findById(
      ClassId.create(sourceClassId),
    );
    if (!sourceClass) {
      throw new Error(`Source class not found: ${sourceClassId}`);
    }

    // 2. Verify student was enrolled in source class
    const sourceEnrollment = sourceClass.getEnrollmentByStudentId(studentId);
    if (!sourceEnrollment) {
      throw new Error(
        `Student ${studentId} was not enrolled in class ${sourceClassId}`,
      );
    }

    // 3. Create new private class
    // The new private class continues from where the group class left
    const newPrivateClass = Class.create({
      name: `${sourceClass.name} - Private (Continuation)`,
      courseId: sourceClass.courseId,
      instructorId: instructorId || sourceClass.instructorId,
      type: 'PRIVATE',
      totalMeetings: packageMeetings,
      maxStudents: 1,
      schedules: schedules || [],
      continuedFromClassId: sourceClassId,
      notes: `Continued from group class: ${sourceClass.name}. Student: ${studentId}`,
    });

    // 5. Activate the class
    newPrivateClass.activate();

    // 6. Enroll the student
    newPrivateClass.enrollStudent(studentId);

    // 7. Save new class
    await this.classRepository.save(newPrivateClass);

    // 8. Publish domain events
    const events = newPrivateClass.clearEvents();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    events.forEach((event) => this.eventBus.publish(event));

    const newClassId: string = newPrivateClass.id.value;
    const courseId: string = sourceClass.courseId;
    const result: ContinueAsPrivateResult = {
      newClassId,
      sourceClassId,
      studentId,
      courseId,
      packageMeetings,
      lessonsRemaining: packageMeetings,
    };
    return result;
  }
}
