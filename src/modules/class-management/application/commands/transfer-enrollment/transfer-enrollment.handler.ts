import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { TransferEnrollmentCommand } from './transfer-enrollment.command';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { EnrollmentStatus, ClassType } from '@prisma/client';

interface TransferResult {
  enrollmentId: string;
  fromClassId: string;
  fromClassName: string;
  toClassId: string;
  toClassName: string;
}

@CommandHandler(TransferEnrollmentCommand)
export class TransferEnrollmentHandler implements ICommandHandler<TransferEnrollmentCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: TransferEnrollmentCommand): Promise<TransferResult> {
    // Find existing enrollment
    const enrollment = await this.prisma.classEnrollment.findUnique({
      where: { id: command.enrollmentId },
      include: {
        class: {
          include: { course: true },
        },
        student: true,
      },
    });

    if (!enrollment) {
      throw new NotFoundException(
        `Enrollment ${command.enrollmentId} not found`,
      );
    }

    // Find target class
    const toClass = await this.prisma.class.findUnique({
      where: { id: command.toClassId },
      include: { course: true },
    });

    if (!toClass) {
      throw new NotFoundException(
        `Target class ${command.toClassId} not found`,
      );
    }

    // Validate same course
    if (toClass.courseId !== enrollment.class.courseId) {
      throw new BadRequestException(
        'Cannot transfer to a class with a different course',
      );
    }

    // Check if already enrolled in target class
    const existingInTarget = await this.prisma.classEnrollment.findFirst({
      where: {
        classId: command.toClassId,
        studentId: enrollment.studentId,
        status: EnrollmentStatus.active,
      },
    });

    if (existingInTarget) {
      throw new ConflictException(
        'Student is already enrolled in the target class',
      );
    }

    // Check capacity for group classes
    if (
      toClass.type === ClassType.group &&
      toClass.currentCapacity >= toClass.maxCapacity
    ) {
      throw new BadRequestException('Target class is at full capacity');
    }

    const fromClassName = enrollment.class.name;

    // Perform transfer in transaction
    await this.prisma.$transaction(async (tx) => {
      // Update enrollment to point to new class
      await tx.classEnrollment.update({
        where: { id: command.enrollmentId },
        data: { classId: command.toClassId },
      });

      // Update source class capacity
      await tx.class.update({
        where: { id: enrollment.classId },
        data: { currentCapacity: { decrement: 1 } },
      });

      // Update target class capacity
      await tx.class.update({
        where: { id: command.toClassId },
        data: { currentCapacity: { increment: 1 } },
      });

      // Create transfer audit log (using credit adjustment for now)
      await tx.creditAdjustment.create({
        data: {
          enrollmentId: command.enrollmentId,
          adjustment: 0,
          creditsBefore: enrollment.meetingCredits,
          creditsAfter: enrollment.meetingCredits,
          reason: 'transfer',
          reasonDetail: `Transferred from ${fromClassName} to ${toClass.name}: ${command.reason}`,
          adjustedById: command.transferredById,
        },
      });
    });

    return {
      enrollmentId: command.enrollmentId,
      fromClassId: enrollment.classId,
      fromClassName,
      toClassId: command.toClassId,
      toClassName: toClass.name,
    };
  }
}
