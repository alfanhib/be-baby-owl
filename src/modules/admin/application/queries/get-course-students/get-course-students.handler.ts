import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCourseStudentsQuery } from './get-course-students.query';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { Prisma, EnrollmentStatus } from '@prisma/client';

export interface CourseStudentDto {
  studentId: string;
  fullName: string;
  email: string;
  avatar: string | null;
  enrollments: {
    enrollmentId: string;
    classId: string;
    className: string;
    status: string;
    enrolledAt: Date;
    completedAt: Date | null;
    meetingCredits: number;
    creditsUsed: number;
    remainingCredits: number;
    attendanceRate: number | null;
  }[];
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
}

export interface PaginatedCourseStudents {
  courseId: string;
  courseTitle: string;
  data: CourseStudentDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: {
    totalUniqueStudents: number;
    totalEnrollments: number;
    activeEnrollments: number;
    completedEnrollments: number;
  };
}

@QueryHandler(GetCourseStudentsQuery)
export class GetCourseStudentsHandler implements IQueryHandler<GetCourseStudentsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: GetCourseStudentsQuery,
  ): Promise<PaginatedCourseStudents | null> {
    const { courseId, search, status, classId, page, limit } = query;

    // First verify course exists
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true },
    });

    if (!course) {
      return null;
    }

    // Build where clause for enrollments
    const classWhere: Prisma.ClassWhereInput = {
      courseId,
    };

    if (classId) {
      classWhere.id = classId;
    }

    // Get all enrollments for this course with student info
    const enrollmentWhere: Prisma.ClassEnrollmentWhereInput = {
      class: classWhere,
    };

    if (status) {
      enrollmentWhere.status = status as EnrollmentStatus;
    }

    if (search) {
      enrollmentWhere.student = {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    // Get all enrollments
    const allEnrollments = await this.prisma.classEnrollment.findMany({
      where: enrollmentWhere,
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    // Group enrollments by student
    const studentMap = new Map<string, CourseStudentDto>();

    for (const enrollment of allEnrollments) {
      const studentId = enrollment.studentId;

      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          studentId,
          fullName: enrollment.student.fullName,
          email: enrollment.student.email,
          avatar: enrollment.student.avatar,
          enrollments: [],
          totalEnrollments: 0,
          activeEnrollments: 0,
          completedEnrollments: 0,
        });
      }

      const studentData = studentMap.get(studentId)!;
      studentData.enrollments.push({
        enrollmentId: enrollment.id,
        classId: enrollment.classId,
        className: enrollment.class.name,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt,
        meetingCredits: enrollment.meetingCredits,
        creditsUsed: enrollment.creditsUsed,
        remainingCredits: enrollment.meetingCredits - enrollment.creditsUsed,
        attendanceRate: enrollment.attendanceRate
          ? Number(enrollment.attendanceRate)
          : null,
      });

      studentData.totalEnrollments++;
      if (enrollment.status === 'active') {
        studentData.activeEnrollments++;
      } else if (enrollment.status === 'completed') {
        studentData.completedEnrollments++;
      }
    }

    // Convert to array and paginate
    const allStudents = Array.from(studentMap.values());
    const total = allStudents.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedStudents = allStudents.slice(
      (page - 1) * limit,
      page * limit,
    );

    // Calculate summary
    const summary = {
      totalUniqueStudents: total,
      totalEnrollments: allEnrollments.length,
      activeEnrollments: allEnrollments.filter((e) => e.status === 'active')
        .length,
      completedEnrollments: allEnrollments.filter(
        (e) => e.status === 'completed',
      ).length,
    };

    return {
      courseId: course.id,
      courseTitle: course.title,
      data: paginatedStudents,
      total,
      page,
      limit,
      totalPages,
      summary,
    };
  }
}
