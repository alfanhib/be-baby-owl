import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetClassRosterQuery } from './get-class-roster.query';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

export interface RosterItem {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: string;
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  enrolledAt: Date;
  completedAt: Date | null;
  attendanceCount: number;
  notes: string | null;
}

export interface ClassRosterResult {
  classId: string;
  className: string;
  totalStudents: number;
  activeStudents: number;
  roster: RosterItem[];
}

@QueryHandler(GetClassRosterQuery)
export class GetClassRosterHandler implements IQueryHandler<GetClassRosterQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetClassRosterQuery): Promise<ClassRosterResult | null> {
    const classEntity = await this.prisma.class.findUnique({
      where: { id: query.classId },
      include: {
        enrollments: {
          include: {
            student: { select: { fullName: true, email: true } },
            attendances: true,
          },
          orderBy: { enrolledAt: 'asc' },
        },
      },
    });

    if (!classEntity) {
      return null;
    }

    const roster: RosterItem[] = classEntity.enrollments.map((e) => ({
      enrollmentId: e.id,
      studentId: e.studentId,
      studentName: e.student.fullName,
      studentEmail: e.student.email,
      status: e.status,
      totalCredits: e.meetingCredits,
      usedCredits: e.creditsUsed,
      remainingCredits: e.meetingCredits - e.creditsUsed,
      enrolledAt: e.enrolledAt,
      completedAt: e.completedAt,
      attendanceCount: e.attendances.filter((a) =>
        ['present', 'late'].includes(a.status),
      ).length,
      notes: null, // ClassEnrollment doesn't have notes field in schema
    }));

    return {
      classId: classEntity.id,
      className: classEntity.name,
      totalStudents: roster.length,
      activeStudents: roster.filter((r) => r.status === 'active').length,
      roster,
    };
  }
}
