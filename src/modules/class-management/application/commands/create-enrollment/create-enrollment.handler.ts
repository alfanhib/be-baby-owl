import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CreateEnrollmentCommand } from './create-enrollment.command';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { ClassStatus, PaymentStatus, UserRole } from '@prisma/client';
import { randomBytes } from 'crypto';

export interface CreateEnrollmentResult {
  id: string;
  student: {
    id: string;
    name: string;
    email: string;
    isNew: boolean;
  };
  class: {
    id: string;
    name: string;
  };
  status: string;
  paymentStatus: string;
}

@CommandHandler(CreateEnrollmentCommand)
export class CreateEnrollmentHandler implements ICommandHandler<CreateEnrollmentCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    command: CreateEnrollmentCommand,
  ): Promise<CreateEnrollmentResult> {
    // Find class
    const classEntity = await this.prisma.class.findUnique({
      where: { id: command.classId },
    });

    if (!classEntity) {
      throw new NotFoundException(`Class ${command.classId} not found`);
    }

    // Validate class status
    if (
      classEntity.status !== ClassStatus.enrollment_open &&
      classEntity.status !== ClassStatus.draft
    ) {
      throw new BadRequestException('Class is not open for enrollment');
    }

    // Check capacity
    if (classEntity.currentCapacity >= classEntity.maxCapacity) {
      throw new BadRequestException('Class is at full capacity');
    }

    // Validate payment status
    const validStatuses: PaymentStatus[] = ['pending', 'verified'];
    if (!validStatuses.includes(command.paymentStatus as PaymentStatus)) {
      throw new BadRequestException(
        `Invalid payment status: ${command.paymentStatus}`,
      );
    }

    // Need either studentId or student data
    if (!command.studentId && !command.student) {
      throw new BadRequestException(
        'Either studentId or student data is required',
      );
    }

    let studentId: string;
    let studentName: string;
    let studentEmail: string;
    let isNewStudent = false;

    if (command.studentId) {
      // Use existing student
      const student = await this.prisma.user.findUnique({
        where: { id: command.studentId },
      });

      if (!student) {
        throw new NotFoundException(`Student ${command.studentId} not found`);
      }

      studentId = student.id;
      studentName = student.fullName;
      studentEmail = student.email;
    } else if (command.student) {
      // Find or create student
      let student = await this.prisma.user.findUnique({
        where: { email: command.student.email },
      });

      if (student) {
        studentId = student.id;
        studentName = student.fullName;
        studentEmail = student.email;
      } else {
        // Create new student
        const tempPassword = randomBytes(8).toString('hex');

        student = await this.prisma.user.create({
          data: {
            email: command.student.email,
            fullName: command.student.name,
            role: UserRole.student,
            passwordHash: tempPassword, // Should be hashed in production
            mustChangePassword: true,
          },
        });

        studentId = student.id;
        studentName = student.fullName;
        studentEmail = student.email;
        isNewStudent = true;
      }
    } else {
      throw new BadRequestException(
        'Either studentId or student data is required',
      );
    }

    // Check if already enrolled
    const existingEnrollment = await this.prisma.classEnrollment.findUnique({
      where: {
        classId_studentId: {
          classId: command.classId,
          studentId,
        },
      },
    });

    if (existingEnrollment) {
      throw new ConflictException('Student is already enrolled in this class');
    }

    // Create enrollment in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const enrollment = await tx.classEnrollment.create({
        data: {
          classId: command.classId,
          studentId,
          meetingCredits: classEntity.totalMeetings,
          paymentStatus: command.paymentStatus as PaymentStatus,
          paymentAmount: command.amount,
        },
      });

      // Update class capacity
      await tx.class.update({
        where: { id: command.classId },
        data: {
          currentCapacity: {
            increment: 1,
          },
        },
      });

      return enrollment;
    });

    return {
      id: result.id,
      student: {
        id: studentId,
        name: studentName,
        email: studentEmail,
        isNew: isNewStudent,
      },
      class: {
        id: classEntity.id,
        name: classEntity.name,
      },
      status: result.status,
      paymentStatus: result.paymentStatus,
    };
  }
}
