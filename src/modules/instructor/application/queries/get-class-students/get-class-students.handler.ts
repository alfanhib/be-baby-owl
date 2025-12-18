import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { GetClassStudentsQuery } from './get-class-students.query';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

interface StudentInClass {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  enrollmentId: string;
  progress: {
    lessonsCompleted: number;
    percentage: number;
    lastActiveAt: Date | null;
  };
  attendance: {
    present: number;
    absent: number;
    late: number;
    rate: number;
  };
  isAtRisk: boolean;
}

function toNumber(value: Decimal | number | null): number {
  if (value === null) return 0;
  if (typeof value === 'number') return value;
  return value.toNumber();
}

@QueryHandler(GetClassStudentsQuery)
export class GetClassStudentsHandler implements IQueryHandler<GetClassStudentsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetClassStudentsQuery): Promise<StudentInClass[]> {
    const { classId, instructorId } = query;

    // Verify class belongs to instructor
    const cls = await this.prisma.class.findUnique({
      where: { id: classId },
      include: {
        course: {
          include: {
            sections: {
              include: { lessons: { select: { id: true } } },
            },
          },
        },
      },
    });

    if (!cls) {
      throw new NotFoundException(`Class ${classId} not found`);
    }

    if (cls.instructorId !== instructorId) {
      throw new ForbiddenException('This class is not assigned to you');
    }

    const totalLessons = cls.course.sections.reduce(
      (acc, section) => acc + section.lessons.length,
      0,
    );

    // Get enrollments with student info and attendance
    const enrollments = await this.prisma.classEnrollment.findMany({
      where: { classId, status: 'active' },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
            lastLoginAt: true,
          },
        },
        attendances: {
          select: { status: true },
        },
      },
      orderBy: { enrolledAt: 'asc' },
    });

    return enrollments.map((enrollment) => {
      const attendances = enrollment.attendances;
      const presentCount = attendances.filter(
        (a) => a.status === 'present',
      ).length;
      const absentCount = attendances.filter(
        (a) => a.status === 'absent',
      ).length;
      const lateCount = attendances.filter((a) => a.status === 'late').length;
      const totalAttendance = attendances.length;
      const attendanceRate =
        totalAttendance > 0
          ? Math.round(((presentCount + lateCount) / totalAttendance) * 100)
          : 100;

      const progressPercentage =
        totalLessons > 0
          ? Math.round((enrollment.lessonsCompleted / totalLessons) * 100)
          : 0;

      // At-risk: no progress after having access, or low attendance
      const isAtRisk =
        (cls.lessonsUnlocked > 3 && enrollment.lessonsCompleted === 0) ||
        (totalAttendance > 3 && attendanceRate < 50) ||
        toNumber(enrollment.attendanceRate) < 50;

      return {
        id: enrollment.student.id,
        name: enrollment.student.fullName,
        email: enrollment.student.email,
        avatar: enrollment.student.avatar,
        enrollmentId: enrollment.id,
        progress: {
          lessonsCompleted: enrollment.lessonsCompleted,
          percentage: progressPercentage,
          lastActiveAt: enrollment.student.lastLoginAt,
        },
        attendance: {
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          rate: attendanceRate,
        },
        isAtRisk,
      };
    });
  }
}
