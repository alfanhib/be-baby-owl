import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { QuickEnrollCommand } from './quick-enroll.command';
import {
  IClassRepository,
  CLASS_REPOSITORY,
} from '@class-management/domain/repositories/class.repository.interface';
import { ClassId } from '@class-management/domain/value-objects/class-id.vo';
import { EventBusService } from '@shared/infrastructure/event-bus/event-bus.service';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { PaymentStatus, EnrollmentStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

interface QuickEnrollResult {
  enrollmentId: string;
  studentId: string;
  studentCreated: boolean;
  classId: string;
  className: string;
}

@CommandHandler(QuickEnrollCommand)
export class QuickEnrollHandler implements ICommandHandler<QuickEnrollCommand> {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private readonly classRepository: IClassRepository,
    private readonly eventBus: EventBusService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: QuickEnrollCommand): Promise<QuickEnrollResult> {
    // Validate input
    if (!command.studentId && !command.studentEmail) {
      throw new BadRequestException(
        'Either studentId or student details (email) must be provided',
      );
    }

    // Find the class
    const classEntity = await this.classRepository.findByIdWithEnrollments(
      ClassId.create(command.classId),
    );

    if (!classEntity) {
      throw new NotFoundException(`Class ${command.classId} not found`);
    }

    let studentId: string;
    let studentCreated = false;

    // Use transaction for atomicity
    const result = await this.prisma.$transaction(async (tx) => {
      // Step 1: Get or create student
      if (command.studentId) {
        // Use existing student
        const existingUser = await tx.user.findUnique({
          where: { id: command.studentId },
        });
        if (!existingUser) {
          throw new NotFoundException(`Student ${command.studentId} not found`);
        }
        studentId = command.studentId;
      } else {
        // Check if email already exists
        const existingByEmail = await tx.user.findUnique({
          where: { email: command.studentEmail! },
        });
        if (existingByEmail) {
          throw new ConflictException(
            `User with email ${command.studentEmail} already exists`,
          );
        }

        // Generate temporary password and hash it
        const tempPassword = this.generateTempPassword();
        const passwordHash = await bcrypt.hash(tempPassword, 10);

        // Create user with student role
        const newUser = await tx.user.create({
          data: {
            email: command.studentEmail!,
            passwordHash,
            fullName: command.studentName || 'New Student',
            role: 'student',
            status: 'active',
            emailVerified: false,
            onboardingCompleted: false,
          },
        });

        studentId = newUser.id;
        studentCreated = true;
      }

      // Step 2: Check if already enrolled
      const existingEnrollment = await tx.classEnrollment.findFirst({
        where: {
          classId: command.classId,
          studentId: studentId,
          status: {
            in: [EnrollmentStatus.active],
          },
        },
      });

      if (existingEnrollment) {
        throw new ConflictException(
          'Student is already enrolled in this class',
        );
      }

      // Step 3: Create enrollment
      const enrollment = await tx.classEnrollment.create({
        data: {
          classId: command.classId,
          studentId: studentId,
          meetingCredits: command.packageMeetings,
          creditsUsed: 0,
          status: EnrollmentStatus.active,
        },
      });

      // Step 4: Create payment record linked to this enrollment
      await tx.payment.create({
        data: {
          studentName: command.studentName || 'Unknown',
          studentEmail: command.studentEmail || '',
          studentPhone: command.studentPhone,
          courseId: classEntity.courseId,
          packageType: `${command.packageMeetings} Meetings`,
          amount: command.packagePrice,
          paymentMethod: 'other',
          status:
            command.paymentStatus === 'verified'
              ? PaymentStatus.verified
              : PaymentStatus.pending,
          notes:
            command.notes || `Quick enrollment for class ${classEntity.name}`,
          verifiedById:
            command.paymentStatus === 'verified' ? command.enrolledById : null,
          verifiedAt: command.paymentStatus === 'verified' ? new Date() : null,
        },
      });

      // Step 5: Update class capacity
      await tx.class.update({
        where: { id: command.classId },
        data: {
          currentCapacity: { increment: 1 },
        },
      });

      return {
        enrollmentId: enrollment.id,
        studentId,
        studentCreated,
        classId: command.classId,
        className: classEntity.name,
      };
    });

    return result;
  }

  private generateTempPassword(): string {
    // Generate a random temporary password
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Ensure it meets password requirements
    return password + 'Aa1!';
  }
}
