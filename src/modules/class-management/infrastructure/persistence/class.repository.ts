import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { IClassRepository } from '@class-management/domain/repositories/class.repository.interface';
import { Class } from '@class-management/domain/aggregates/class.aggregate';
import { ClassId } from '@class-management/domain/value-objects/class-id.vo';
import { Attendance } from '@class-management/domain/entities/attendance.entity';
import { CreditAdjustment } from '@class-management/domain/entities/credit-adjustment.entity';
import {
  ClassMapper,
  EnrollmentMapper,
  LessonUnlockMapper,
} from './class.mapper';

@Injectable()
export class ClassRepository implements IClassRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: ClassId): Promise<Class | null> {
    const prismaClass = await this.prisma.class.findUnique({
      where: { id: id.value },
      include: {
        lessonUnlocks: true,
      },
    });

    if (!prismaClass) return null;

    return ClassMapper.toDomain({ ...prismaClass, enrollments: [] });
  }

  async findByIdWithEnrollments(id: ClassId): Promise<Class | null> {
    const prismaClass = await this.prisma.class.findUnique({
      where: { id: id.value },
      include: {
        enrollments: true,
        lessonUnlocks: true,
      },
    });

    if (!prismaClass) return null;

    return ClassMapper.toDomain(prismaClass);
  }

  async findByCourseId(courseId: string): Promise<Class[]> {
    const classes = await this.prisma.class.findMany({
      where: { courseId },
      include: {
        enrollments: true,
        lessonUnlocks: true,
      },
    });

    return classes.map((c) => ClassMapper.toDomain(c));
  }

  async findByInstructorId(instructorId: string): Promise<Class[]> {
    const classes = await this.prisma.class.findMany({
      where: { instructorId },
      include: {
        enrollments: true,
        lessonUnlocks: true,
      },
    });

    return classes.map((c) => ClassMapper.toDomain(c));
  }

  async findByStudentId(studentId: string): Promise<Class[]> {
    const enrollments = await this.prisma.classEnrollment.findMany({
      where: { studentId, status: 'active' },
      select: { classId: true },
    });

    const classIds = enrollments.map((e) => e.classId);

    const classes = await this.prisma.class.findMany({
      where: { id: { in: classIds } },
      include: {
        enrollments: true,
        lessonUnlocks: true,
      },
    });

    return classes.map((c) => ClassMapper.toDomain(c));
  }

  async save(classEntity: Class): Promise<void> {
    const data = ClassMapper.toPrisma(classEntity);

    await this.prisma.$transaction(async (tx) => {
      // Upsert class
      await tx.class.upsert({
        where: { id: data.id },
        create: {
          id: data.id,
          name: data.name,
          courseId: data.courseId,
          instructorId: data.instructorId,
          type: data.type as 'group' | 'private',
          status: data.status as
            | 'draft'
            | 'enrollment_open'
            | 'active'
            | 'completed'
            | 'cancelled',
          totalMeetings: data.totalMeetings,
          meetingsCompleted: data.meetingsCompleted,
          maxCapacity: data.maxCapacity,
          currentCapacity: data.currentCapacity,
          schedule: data.schedule as object,
          startDate: data.startDate,
          endDate: data.endDate,
          enrollmentDeadline: data.enrollmentDeadline,
          continuedFromClassId: data.continuedFromClassId,
        },
        update: {
          name: data.name,
          status: data.status as
            | 'draft'
            | 'enrollment_open'
            | 'active'
            | 'completed'
            | 'cancelled',
          totalMeetings: data.totalMeetings,
          meetingsCompleted: data.meetingsCompleted,
          maxCapacity: data.maxCapacity,
          currentCapacity: data.currentCapacity,
          schedule: data.schedule as object,
          startDate: data.startDate,
          endDate: data.endDate,
          enrollmentDeadline: data.enrollmentDeadline,
        },
      });

      // Upsert enrollments
      for (const enrollment of classEntity.enrollments) {
        const enrollmentData = EnrollmentMapper.toPrisma(enrollment);
        await tx.classEnrollment.upsert({
          where: { id: enrollmentData.id },
          create: {
            id: enrollmentData.id,
            classId: enrollmentData.classId,
            studentId: enrollmentData.studentId,
            status: enrollmentData.status as
              | 'active'
              | 'completed'
              | 'withdrawn',
            meetingCredits: enrollmentData.meetingCredits,
            creditsUsed: enrollmentData.creditsUsed,
            enrolledAt: enrollmentData.enrolledAt,
            completedAt: enrollmentData.completedAt,
          },
          update: {
            status: enrollmentData.status as
              | 'active'
              | 'completed'
              | 'withdrawn',
            meetingCredits: enrollmentData.meetingCredits,
            creditsUsed: enrollmentData.creditsUsed,
            completedAt: enrollmentData.completedAt,
          },
        });
      }

      // Upsert lesson unlocks
      for (const unlock of classEntity.lessonUnlocks) {
        const unlockData = LessonUnlockMapper.toPrisma(unlock);
        await tx.lessonUnlock.upsert({
          where: { id: unlockData.id },
          create: {
            id: unlockData.id,
            classId: unlockData.classId,
            lessonId: unlockData.lessonId,
            unlockedBy: unlockData.unlockedBy,
            unlockedAt: unlockData.unlockedAt,
          },
          update: {
            unlockedAt: unlockData.unlockedAt,
          },
        });
      }
    });
  }

  async delete(id: ClassId): Promise<void> {
    await this.prisma.class.delete({
      where: { id: id.value },
    });
  }

  async saveAttendance(attendance: Attendance): Promise<void> {
    await this.prisma.classAttendance.upsert({
      where: { id: attendance.id.value },
      create: {
        id: attendance.id.value,
        classId: attendance.classId,
        enrollmentId: attendance.enrollmentId,
        meetingNumber: attendance.meetingNumber,
        meetingDate: attendance.meetingDate,
        status: attendance.status.value as 'present' | 'absent' | 'late',
        creditDeducted: attendance.creditConsumed,
        markedById: attendance.markedBy,
        markedAt: attendance.markedAt,
        notes: attendance.notes,
      },
      update: {
        status: attendance.status.value as 'present' | 'absent' | 'late',
        creditDeducted: attendance.creditConsumed,
        updatedById: attendance.lastEditedBy,
        updatedAt: attendance.lastEditedAt,
        notes: attendance.notes,
      },
    });
  }

  async findAttendanceByEnrollment(
    enrollmentId: string,
  ): Promise<Attendance[]> {
    const records = await this.prisma.classAttendance.findMany({
      where: { enrollmentId },
      orderBy: { meetingNumber: 'asc' },
    });

    return records.map((r) =>
      Attendance.restore(r.id, {
        enrollmentId: r.enrollmentId,
        classId: r.classId,
        meetingNumber: r.meetingNumber,
        meetingDate: r.meetingDate,
        status: r.status,
        creditConsumed: r.creditDeducted,
        markedBy: r.markedById,
        markedAt: r.markedAt,
        lastEditedBy: r.updatedById ?? undefined,
        lastEditedAt: r.updatedAt ?? undefined,
        notes: r.notes ?? undefined,
      }),
    );
  }

  async findAttendanceByClassAndMeeting(
    classId: string,
    meetingNumber: number,
  ): Promise<Attendance[]> {
    const records = await this.prisma.classAttendance.findMany({
      where: { classId, meetingNumber },
    });

    return records.map((r) =>
      Attendance.restore(r.id, {
        enrollmentId: r.enrollmentId,
        classId: r.classId,
        meetingNumber: r.meetingNumber,
        meetingDate: r.meetingDate,
        status: r.status,
        creditConsumed: r.creditDeducted,
        markedBy: r.markedById,
        markedAt: r.markedAt,
        lastEditedBy: r.updatedById ?? undefined,
        lastEditedAt: r.updatedAt ?? undefined,
        notes: r.notes ?? undefined,
      }),
    );
  }

  async saveCreditAdjustment(adjustment: CreditAdjustment): Promise<void> {
    await this.prisma.creditAdjustment.create({
      data: {
        id: adjustment.id.value,
        enrollmentId: adjustment.enrollmentId,
        adjustment: adjustment.amount,
        creditsBefore: adjustment.previousTotal,
        creditsAfter: adjustment.newTotal,
        reason: adjustment.type, // type maps to reason
        reasonDetail: adjustment.reason, // reason maps to reasonDetail
        adjustedById: adjustment.adjustedBy,
        adjustedAt: adjustment.adjustedAt,
      },
    });
  }

  async findCreditAdjustmentsByEnrollment(
    enrollmentId: string,
  ): Promise<CreditAdjustment[]> {
    const records = await this.prisma.creditAdjustment.findMany({
      where: { enrollmentId },
      orderBy: { adjustedAt: 'desc' },
    });

    return records.map((r) =>
      CreditAdjustment.restore(r.id, {
        enrollmentId: r.enrollmentId,
        amount: r.adjustment,
        type: r.reason, // reason maps back to type
        reason: r.reasonDetail ?? r.reason, // reasonDetail maps back to reason
        adjustedBy: r.adjustedById,
        adjustedAt: r.adjustedAt,
        previousTotal: r.creditsBefore,
        newTotal: r.creditsAfter,
      }),
    );
  }
}
