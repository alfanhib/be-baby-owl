import {
  Class as PrismaClass,
  ClassEnrollment as PrismaEnrollment,
  LessonUnlock as PrismaLessonUnlock,
} from '@prisma/client';
import { Class } from '@class-management/domain/aggregates/class.aggregate';
import { Enrollment } from '@class-management/domain/entities/enrollment.entity';
import { LessonUnlock } from '@class-management/domain/entities/lesson-unlock.entity';

type PrismaClassWithRelations = PrismaClass & {
  enrollments?: PrismaEnrollment[];
  lessonUnlocks?: PrismaLessonUnlock[];
};

export class ClassMapper {
  static toDomain(prismaClass: PrismaClassWithRelations): Class {
    const enrollments = (prismaClass.enrollments ?? []).map((e) =>
      EnrollmentMapper.toDomain(e),
    );

    const lessonUnlocks = (prismaClass.lessonUnlocks ?? []).map((u) =>
      LessonUnlockMapper.toDomain(u),
    );

    // Parse schedules from JSON
    const schedules = this.parseSchedules(prismaClass.schedule);

    return Class.restore(prismaClass.id, {
      name: prismaClass.name,
      courseId: prismaClass.courseId,
      instructorId: prismaClass.instructorId,
      type: prismaClass.type,
      status: prismaClass.status,
      totalMeetings: prismaClass.totalMeetings,
      meetingsCompleted: prismaClass.meetingsCompleted,
      maxStudents: prismaClass.maxCapacity,
      schedules,
      startDate: prismaClass.startDate ?? undefined,
      endDate: prismaClass.endDate ?? undefined,
      enrollmentDeadline: prismaClass.enrollmentDeadline ?? undefined,
      continuedFromClassId: prismaClass.continuedFromClassId ?? undefined,
      enrollments,
      lessonUnlocks,
      notes: undefined,
      createdAt: prismaClass.createdAt,
      updatedAt: prismaClass.updatedAt,
    });
  }

  static toPrisma(classEntity: Class): {
    id: string;
    name: string;
    courseId: string;
    instructorId: string;
    type: string;
    status: string;
    totalMeetings: number;
    meetingsCompleted: number;
    maxCapacity: number;
    currentCapacity: number;
    schedule: unknown;
    startDate: Date | null;
    endDate: Date | null;
    enrollmentDeadline: Date | null;
    continuedFromClassId: string | null;
  } {
    return {
      id: classEntity.id.value,
      name: classEntity.name,
      courseId: classEntity.courseId,
      instructorId: classEntity.instructorId,
      type: classEntity.type.value,
      status: classEntity.status.value,
      totalMeetings: classEntity.totalMeetings,
      meetingsCompleted: classEntity.meetingsCompleted,
      maxCapacity: classEntity.maxStudents ?? 30,
      currentCapacity: classEntity.studentCount,
      schedule: this.formatSchedules(classEntity.schedules),
      startDate: classEntity.startDate ?? null,
      endDate: classEntity.endDate ?? null,
      enrollmentDeadline: classEntity.enrollmentDeadline ?? null,
      continuedFromClassId: classEntity.continuedFromClassId ?? null,
    };
  }

  private static parseSchedules(schedule: unknown): Array<{
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    timezone: string;
  }> {
    if (!schedule) return [];

    // Handle old format: { days: ['Monday'], time: '19:00-21:00' }
    const parsed = schedule as Record<string, unknown>;
    if (parsed.days && parsed.time) {
      const days = parsed.days as string[];
      const time = parsed.time as string;
      const [startTime, endTime] = time.split('-');

      return days.map((day) => ({
        dayOfWeek: day.toLowerCase(),
        startTime: startTime ?? '00:00',
        endTime: endTime ?? '23:59',
        timezone: 'Asia/Jakarta',
      }));
    }

    // Handle new format: Array of schedule objects
    if (Array.isArray(schedule)) {
      return schedule as Array<{
        dayOfWeek: string;
        startTime: string;
        endTime: string;
        timezone: string;
      }>;
    }

    return [];
  }

  private static formatSchedules(
    schedules: Array<{
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      timezone: string;
    }>,
  ): unknown {
    if (!schedules || schedules.length === 0) return null;

    // Store as array format
    return schedules.map((s) => ({
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      timezone: s.timezone,
    }));
  }
}

export class EnrollmentMapper {
  static toDomain(prismaEnrollment: PrismaEnrollment): Enrollment {
    return Enrollment.restore(prismaEnrollment.id, {
      classId: prismaEnrollment.classId,
      studentId: prismaEnrollment.studentId,
      status: prismaEnrollment.status,
      totalCredits: prismaEnrollment.meetingCredits,
      usedCredits: prismaEnrollment.creditsUsed,
      enrolledAt: prismaEnrollment.enrolledAt,
      completedAt: prismaEnrollment.completedAt ?? undefined,
      notes: undefined,
    });
  }

  static toPrisma(enrollment: Enrollment): {
    id: string;
    classId: string;
    studentId: string;
    status: string;
    meetingCredits: number;
    creditsUsed: number;
    enrolledAt: Date;
    completedAt: Date | null;
  } {
    return {
      id: enrollment.id.value,
      classId: enrollment.classId,
      studentId: enrollment.studentId,
      status: enrollment.status.value,
      meetingCredits: enrollment.credits.total,
      creditsUsed: enrollment.credits.used,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt ?? null,
    };
  }
}

export class LessonUnlockMapper {
  static toDomain(prismaUnlock: PrismaLessonUnlock): LessonUnlock {
    return LessonUnlock.restore(prismaUnlock.id, {
      classId: prismaUnlock.classId,
      lessonId: prismaUnlock.lessonId,
      unlockedBy: prismaUnlock.unlockedBy,
      unlockedAt: prismaUnlock.unlockedAt,
      meetingNumber: undefined, // Not in schema
      notes: undefined, // Not in schema
    });
  }

  static toPrisma(unlock: LessonUnlock): {
    id: string;
    classId: string;
    lessonId: string;
    unlockedBy: string;
    unlockedAt: Date;
  } {
    return {
      id: unlock.id.value,
      classId: unlock.classId,
      lessonId: unlock.lessonId,
      unlockedBy: unlock.unlockedBy,
      unlockedAt: unlock.unlockedAt,
    };
  }
}
