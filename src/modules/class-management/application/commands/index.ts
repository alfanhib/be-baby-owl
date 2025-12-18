// Class Commands
export * from './create-class/create-class.command';
export * from './create-class/create-class.handler';
export * from './update-class/update-class.command';
export * from './update-class/update-class.handler';
export * from './open-enrollment/open-enrollment.command';
export * from './open-enrollment/open-enrollment.handler';
export * from './activate-class/activate-class.command';
export * from './activate-class/activate-class.handler';
export * from './complete-class/complete-class.command';
export * from './complete-class/complete-class.handler';
export * from './cancel-class/cancel-class.command';
export * from './cancel-class/cancel-class.handler';

// Enrollment Commands
export * from './enroll-student/enroll-student.command';
export * from './enroll-student/enroll-student.handler';
export * from './remove-student/remove-student.command';
export * from './remove-student/remove-student.handler';
export * from './transfer-enrollment/transfer-enrollment.command';
export * from './transfer-enrollment/transfer-enrollment.handler';
export * from './cancel-enrollment/cancel-enrollment.command';
export * from './cancel-enrollment/cancel-enrollment.handler';

// Attendance Commands
export * from './mark-attendance/mark-attendance.command';
export * from './mark-attendance/mark-attendance.handler';
export * from './update-attendance/update-attendance.command';
export * from './update-attendance/update-attendance.handler';

// Credit Commands
export * from './adjust-credits/adjust-credits.command';
export * from './adjust-credits/adjust-credits.handler';

// Lesson Unlock Commands
export * from './unlock-lesson/unlock-lesson.command';
export * from './unlock-lesson/unlock-lesson.handler';

import { CreateClassHandler } from './create-class/create-class.handler';
import { UpdateClassHandler } from './update-class/update-class.handler';
import { OpenEnrollmentHandler } from './open-enrollment/open-enrollment.handler';
import { ActivateClassHandler } from './activate-class/activate-class.handler';
import { CompleteClassHandler } from './complete-class/complete-class.handler';
import { CancelClassHandler } from './cancel-class/cancel-class.handler';
import { EnrollStudentHandler } from './enroll-student/enroll-student.handler';
import { RemoveStudentHandler } from './remove-student/remove-student.handler';
import { TransferEnrollmentHandler } from './transfer-enrollment/transfer-enrollment.handler';
import { CancelEnrollmentHandler } from './cancel-enrollment/cancel-enrollment.handler';
import { MarkAttendanceHandler } from './mark-attendance/mark-attendance.handler';
import { UpdateAttendanceHandler } from './update-attendance/update-attendance.handler';
import { AdjustCreditsHandler } from './adjust-credits/adjust-credits.handler';
import { UnlockLessonHandler } from './unlock-lesson/unlock-lesson.handler';

export const CommandHandlers = [
  // Class
  CreateClassHandler,
  UpdateClassHandler,
  OpenEnrollmentHandler,
  ActivateClassHandler,
  CompleteClassHandler,
  CancelClassHandler,
  // Enrollment
  EnrollStudentHandler,
  RemoveStudentHandler,
  TransferEnrollmentHandler,
  CancelEnrollmentHandler,
  // Attendance
  MarkAttendanceHandler,
  UpdateAttendanceHandler,
  // Credits
  AdjustCreditsHandler,
  // Lesson Unlock
  UnlockLessonHandler,
];
