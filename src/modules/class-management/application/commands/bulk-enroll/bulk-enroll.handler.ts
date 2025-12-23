import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BulkEnrollCommand } from './bulk-enroll.command';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { ClassStatus, PaymentStatus, UserRole } from '@prisma/client';
import { randomBytes } from 'crypto';

interface BulkEnrollError {
  email: string;
  error: string;
}

interface BulkEnrollmentResult {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
}

export interface BulkEnrollResult {
  created: number;
  failed: number;
  enrollments: BulkEnrollmentResult[];
  errors: BulkEnrollError[];
}

@CommandHandler(BulkEnrollCommand)
export class BulkEnrollHandler implements ICommandHandler<BulkEnrollCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: BulkEnrollCommand): Promise<BulkEnrollResult> {
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
    const availableSlots =
      classEntity.maxCapacity - classEntity.currentCapacity;
    if (command.students.length > availableSlots) {
      throw new BadRequestException(
        `Not enough capacity. Available: ${availableSlots}, Requested: ${command.students.length}`,
      );
    }

    // Validate payment status
    const validStatuses: PaymentStatus[] = ['pending', 'verified'];
    if (!validStatuses.includes(command.paymentStatus as PaymentStatus)) {
      throw new BadRequestException(
        `Invalid payment status: ${command.paymentStatus}`,
      );
    }

    const enrollments: BulkEnrollmentResult[] = [];
    const errors: BulkEnrollError[] = [];

    // Process each student
    for (const studentInput of command.students) {
      try {
        // Find or create student
        let student = await this.prisma.user.findUnique({
          where: { email: studentInput.email },
        });

        if (!student) {
          // Generate random password
          const tempPassword = randomBytes(8).toString('hex');

          student = await this.prisma.user.create({
            data: {
              email: studentInput.email,
              fullName: studentInput.name,
              role: UserRole.student,
              passwordHash: tempPassword, // Should be hashed in production
              mustChangePassword: true,
            },
          });
        }

        // Check if already enrolled
        const existingEnrollment = await this.prisma.classEnrollment.findUnique(
          {
            where: {
              classId_studentId: {
                classId: command.classId,
                studentId: student.id,
              },
            },
          },
        );

        if (existingEnrollment) {
          errors.push({
            email: studentInput.email,
            error: 'Student already enrolled in this class',
          });
          continue;
        }

        // Create enrollment
        const enrollment = await this.prisma.classEnrollment.create({
          data: {
            classId: command.classId,
            studentId: student.id,
            meetingCredits: classEntity.totalMeetings,
            paymentStatus: command.paymentStatus as PaymentStatus,
            paymentAmount: command.amount,
          },
        });

        // Update class capacity
        await this.prisma.class.update({
          where: { id: command.classId },
          data: {
            currentCapacity: {
              increment: 1,
            },
          },
        });

        enrollments.push({
          id: enrollment.id,
          studentId: student.id,
          studentName: student.fullName,
          studentEmail: student.email,
        });
      } catch (error) {
        errors.push({
          email: studentInput.email,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      created: enrollments.length,
      failed: errors.length,
      enrollments,
      errors,
    };
  }
}
