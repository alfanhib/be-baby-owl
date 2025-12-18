import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAtRiskStudentsQuery } from './get-at-risk-students.query';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

interface AtRiskStudent {
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  reason: string;
  lastActiveAt: Date | null;
  progress: number;
}

@QueryHandler(GetAtRiskStudentsQuery)
export class GetAtRiskStudentsHandler implements IQueryHandler<GetAtRiskStudentsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetAtRiskStudentsQuery): Promise<AtRiskStudent[]> {
    const { instructorId } = query;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get all active enrollments in instructor's active classes
    const enrollments = await this.prisma.classEnrollment.findMany({
      where: {
        status: 'active',
        class: {
          instructorId,
          status: 'active',
        },
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            lastLoginAt: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            lessonsUnlocked: true,
          },
        },
        attendances: {
          select: { status: true },
        },
      },
    });

    const atRiskStudents: AtRiskStudent[] = [];

    for (const enrollment of enrollments) {
      const reasons: string[] = [];

      // Check for inactivity (no login in 7+ days)
      if (
        !enrollment.student.lastLoginAt ||
        enrollment.student.lastLoginAt < sevenDaysAgo
      ) {
        reasons.push('No activity for 7+ days');
      }

      // Check for no progress with available lessons
      if (
        enrollment.class.lessonsUnlocked > 3 &&
        enrollment.lessonsCompleted === 0
      ) {
        reasons.push('No progress with available lessons');
      }

      // Check for low attendance
      const totalAttendance = enrollment.attendances.length;
      if (totalAttendance > 0) {
        const absentCount = enrollment.attendances.filter(
          (a) => a.status === 'absent',
        ).length;
        const absentRate = (absentCount / totalAttendance) * 100;
        if (absentRate > 30) {
          reasons.push(`High absence rate (${Math.round(absentRate)}%)`);
        }
      }

      // If any risk factors, add to list
      if (reasons.length > 0) {
        const progress =
          enrollment.class.lessonsUnlocked > 0
            ? Math.round(
                (enrollment.lessonsCompleted /
                  enrollment.class.lessonsUnlocked) *
                  100,
              )
            : 0;

        atRiskStudents.push({
          studentId: enrollment.student.id,
          studentName: enrollment.student.fullName,
          classId: enrollment.class.id,
          className: enrollment.class.name,
          reason: reasons.join('; '),
          lastActiveAt: enrollment.student.lastLoginAt,
          progress,
        });
      }
    }

    // Sort by most concerning first (no activity > no progress > low attendance)
    atRiskStudents.sort((a, b) => {
      const aNoActivity = a.reason.includes('No activity');
      const bNoActivity = b.reason.includes('No activity');
      if (aNoActivity && !bNoActivity) return -1;
      if (!aNoActivity && bNoActivity) return 1;
      return a.progress - b.progress;
    });

    return atRiskStudents;
  }
}
