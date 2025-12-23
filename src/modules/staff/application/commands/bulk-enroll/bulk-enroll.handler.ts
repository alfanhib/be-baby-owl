import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BulkEnrollCommand, BulkEnrollStudent } from './bulk-enroll.command';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { EnrollmentStatus, PaymentStatus, ClassType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

interface EnrollmentResult {
  email: string;
  success: boolean;
  enrollmentId?: string;
  error?: string;
}

interface BulkEnrollResult {
  total: number;
  successful: number;
  failed: number;
  results: EnrollmentResult[];
}

@CommandHandler(BulkEnrollCommand)
export class BulkEnrollHandler implements ICommandHandler<BulkEnrollCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: BulkEnrollCommand): Promise<BulkEnrollResult> {
    const { classId, students, paymentStatus, enrolledById } = command;

    // Validate class exists
    const classEntity = await this.prisma.class.findUnique({
      where: { id: classId },
      include: { course: { select: { id: true } } },
    });

    if (!classEntity) {
      throw new NotFoundException(`Class ${classId} not found`);
    }

    // Check capacity for group classes
    if (classEntity.type === ClassType.group) {
      const availableSlots =
        classEntity.maxCapacity - classEntity.currentCapacity;
      if (students.length > availableSlots) {
        throw new BadRequestException(
          `Not enough capacity. Available: ${availableSlots}, Requested: ${students.length}`,
        );
      }
    }

    const results: EnrollmentResult[] = [];
    let successCount = 0;

    for (const student of students) {
      try {
        const result = await this.enrollStudent(
          student,
          classEntity,
          paymentStatus,
          enrolledById,
        );
        results.push(result);
        if (result.success) successCount++;
      } catch (error) {
        results.push({
          email: student.email,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      total: students.length,
      successful: successCount,
      failed: students.length - successCount,
      results,
    };
  }

  private async enrollStudent(
    student: BulkEnrollStudent,
    classEntity: {
      id: string;
      name: string;
      course: { id: string };
    },
    paymentStatus: 'pending' | 'verified',
    enrolledById: string,
  ): Promise<EnrollmentResult> {
    return this.prisma.$transaction(async (tx) => {
      // Find or create user
      let user = await tx.user.findUnique({
        where: { email: student.email },
      });

      if (!user) {
        // Create new user with temp password
        const tempPassword = Math.random().toString(36).slice(-8);
        const passwordHash = await bcrypt.hash(tempPassword, 10);

        user = await tx.user.create({
          data: {
            email: student.email,
            passwordHash,
            fullName: student.name,
            role: 'student',
            status: 'active',
            emailVerified: false,
            onboardingCompleted: false,
          },
        });
      }

      // Check if already enrolled
      const existingEnrollment = await tx.classEnrollment.findUnique({
        where: {
          classId_studentId: {
            classId: classEntity.id,
            studentId: user.id,
          },
        },
      });

      if (existingEnrollment) {
        return {
          email: student.email,
          success: false,
          error: 'Already enrolled in this class',
        };
      }

      // Create enrollment
      const enrollment = await tx.classEnrollment.create({
        data: {
          classId: classEntity.id,
          studentId: user.id,
          meetingCredits: student.packageMeetings,
          creditsUsed: 0,
          status: EnrollmentStatus.active,
        },
      });

      // Create payment record
      await tx.payment.create({
        data: {
          studentName: student.name,
          studentEmail: student.email,
          studentPhone: student.phone,
          courseId: classEntity.course.id,
          packageType: `${student.packageMeetings} Meetings`,
          amount: student.packagePrice,
          paymentMethod: 'other',
          status:
            paymentStatus === 'verified'
              ? PaymentStatus.verified
              : PaymentStatus.pending,
          notes:
            student.notes || `Bulk enrollment for class ${classEntity.name}`,
          verifiedById: paymentStatus === 'verified' ? enrolledById : null,
          verifiedAt: paymentStatus === 'verified' ? new Date() : null,
        },
      });

      // Update class capacity
      await tx.class.update({
        where: { id: classEntity.id },
        data: { currentCapacity: { increment: 1 } },
      });

      return {
        email: student.email,
        success: true,
        enrollmentId: enrollment.id,
      };
    });
  }
}
