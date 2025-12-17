import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  GetClassAttendanceQuery,
  GetStudentAttendanceQuery,
} from './get-class-attendance.query';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

export interface AttendanceRecordItem {
  attendanceId: string;
  enrollmentId: string;
  studentId: string;
  studentName: string;
  meetingNumber: number;
  meetingDate: Date;
  status: string;
  creditConsumed: boolean;
  markedBy: string;
  markedAt: Date;
  notes: string | null;
}

export interface ClassAttendanceResult {
  classId: string;
  className: string;
  meetingNumber?: number;
  totalMeetings: number;
  records: AttendanceRecordItem[];
  summary: {
    present: number;
    absent: number;
    late: number;
  };
}

export interface StudentAttendanceResult {
  classId: string;
  className: string;
  studentId: string;
  studentName: string;
  totalMeetings: number;
  attendedMeetings: number;
  attendancePercentage: number;
  records: AttendanceRecordItem[];
}

@QueryHandler(GetClassAttendanceQuery)
export class GetClassAttendanceHandler implements IQueryHandler<GetClassAttendanceQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: GetClassAttendanceQuery,
  ): Promise<ClassAttendanceResult | null> {
    const classEntity = await this.prisma.class.findUnique({
      where: { id: query.classId },
    });

    if (!classEntity) {
      return null;
    }

    const where: Record<string, unknown> = { classId: query.classId };
    if (query.meetingNumber) {
      where.meetingNumber = query.meetingNumber;
    }

    const attendance = await this.prisma.classAttendance.findMany({
      where,
      include: {
        enrollment: {
          include: {
            student: { select: { fullName: true } },
          },
        },
        markedBy: { select: { fullName: true } },
      },
      orderBy: [
        { meetingNumber: 'asc' },
        { enrollment: { enrolledAt: 'asc' } },
      ],
    });

    const records: AttendanceRecordItem[] = attendance.map((a) => ({
      attendanceId: a.id,
      enrollmentId: a.enrollmentId,
      studentId: a.enrollment.studentId,
      studentName: a.enrollment.student.fullName,
      meetingNumber: a.meetingNumber,
      meetingDate: a.meetingDate,
      status: a.status,
      creditConsumed: a.creditDeducted,
      markedBy: a.markedBy?.fullName ?? 'Unknown',
      markedAt: a.markedAt,
      notes: a.notes,
    }));

    const summary = {
      present: records.filter((r) => r.status === 'present').length,
      absent: records.filter((r) => r.status === 'absent').length,
      late: records.filter((r) => r.status === 'late').length,
    };

    return {
      classId: classEntity.id,
      className: classEntity.name,
      meetingNumber: query.meetingNumber,
      totalMeetings: classEntity.totalMeetings,
      records,
      summary,
    };
  }
}

@QueryHandler(GetStudentAttendanceQuery)
export class GetStudentAttendanceHandler implements IQueryHandler<GetStudentAttendanceQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: GetStudentAttendanceQuery,
  ): Promise<StudentAttendanceResult | null> {
    const enrollment = await this.prisma.classEnrollment.findFirst({
      where: {
        classId: query.classId,
        studentId: query.studentId,
      },
      include: {
        class: true,
        student: { select: { fullName: true } },
        attendances: {
          include: {
            markedBy: { select: { fullName: true } },
          },
          orderBy: { meetingNumber: 'asc' },
        },
      },
    });

    if (!enrollment) {
      return null;
    }

    const records: AttendanceRecordItem[] = enrollment.attendances.map((a) => ({
      attendanceId: a.id,
      enrollmentId: a.enrollmentId,
      studentId: enrollment.studentId,
      studentName: enrollment.student.fullName,
      meetingNumber: a.meetingNumber,
      meetingDate: a.meetingDate,
      status: a.status,
      creditConsumed: a.creditDeducted,
      markedBy: a.markedBy?.fullName ?? 'Unknown',
      markedAt: a.markedAt,
      notes: a.notes,
    }));

    const attendedMeetings = records.filter((r) =>
      ['present', 'late'].includes(r.status),
    ).length;

    return {
      classId: enrollment.classId,
      className: enrollment.class.name,
      studentId: enrollment.studentId,
      studentName: enrollment.student.fullName,
      totalMeetings: enrollment.class.totalMeetings,
      attendedMeetings,
      attendancePercentage:
        enrollment.class.totalMeetings > 0
          ? Math.round(
              (attendedMeetings / enrollment.class.totalMeetings) * 100,
            )
          : 0,
      records,
    };
  }
}
