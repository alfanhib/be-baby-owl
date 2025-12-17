import { Class } from '../aggregates/class.aggregate';
import { ClassId } from '../value-objects/class-id.vo';
import { Attendance } from '../entities/attendance.entity';
import { CreditAdjustment } from '../entities/credit-adjustment.entity';

export const CLASS_REPOSITORY = Symbol('CLASS_REPOSITORY');

export interface IClassRepository {
  findById(id: ClassId): Promise<Class | null>;
  findByIdWithEnrollments(id: ClassId): Promise<Class | null>;
  findByCourseId(courseId: string): Promise<Class[]>;
  findByInstructorId(instructorId: string): Promise<Class[]>;
  findByStudentId(studentId: string): Promise<Class[]>;
  save(classEntity: Class): Promise<void>;
  delete(id: ClassId): Promise<void>;

  // Attendance
  saveAttendance(attendance: Attendance): Promise<void>;
  findAttendanceById(id: string): Promise<Attendance | null>;
  findAttendanceByEnrollment(enrollmentId: string): Promise<Attendance[]>;
  findAttendanceByClassAndMeeting(
    classId: string,
    meetingNumber: number,
  ): Promise<Attendance[]>;

  // Credit Adjustments
  saveCreditAdjustment(adjustment: CreditAdjustment): Promise<void>;
  findCreditAdjustmentsByEnrollment(
    enrollmentId: string,
  ): Promise<CreditAdjustment[]>;
}
