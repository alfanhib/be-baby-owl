// Class Queries
export * from './get-class/get-class.query';
export * from './get-class/get-class.handler';
export * from './get-classes/get-classes.query';
export * from './get-classes/get-classes.handler';

// Roster Queries
export * from './get-class-roster/get-class-roster.query';
export * from './get-class-roster/get-class-roster.handler';

// Attendance Queries
export * from './get-class-attendance/get-class-attendance.query';
export * from './get-class-attendance/get-class-attendance.handler';

// Lesson Unlock Queries
export * from './get-unlocked-lessons/get-unlocked-lessons.query';
export * from './get-unlocked-lessons/get-unlocked-lessons.handler';

// Credit Queries
export * from './get-credit-history/get-credit-history.query';
export * from './get-credit-history/get-credit-history.handler';

// Package Queries
export * from './get-package-info/get-package-info.query';
export * from './get-package-info/get-package-info.handler';

// Enrollment Queries
export * from './get-enrollments/get-enrollments.query';
export * from './get-enrollments/get-enrollments.handler';
export * from './get-enrollment/get-enrollment.query';
export * from './get-enrollment/get-enrollment.handler';
export * from './get-enrollment-stats/get-enrollment-stats.query';
export * from './get-enrollment-stats/get-enrollment-stats.handler';

import { GetClassHandler } from './get-class/get-class.handler';
import {
  GetClassesHandler,
  GetInstructorClassesHandler,
  GetStudentClassesHandler,
} from './get-classes/get-classes.handler';
import { GetClassRosterHandler } from './get-class-roster/get-class-roster.handler';
import {
  GetClassAttendanceHandler,
  GetStudentAttendanceHandler,
} from './get-class-attendance/get-class-attendance.handler';
import { GetUnlockedLessonsHandler } from './get-unlocked-lessons/get-unlocked-lessons.handler';
import { GetCreditHistoryHandler } from './get-credit-history/get-credit-history.handler';
import { GetPackageInfoHandler } from './get-package-info/get-package-info.handler';
import { GetEnrollmentsHandler } from './get-enrollments/get-enrollments.handler';
import { GetEnrollmentHandler } from './get-enrollment/get-enrollment.handler';
import { GetEnrollmentStatsHandler } from './get-enrollment-stats/get-enrollment-stats.handler';

export const QueryHandlers = [
  // Class
  GetClassHandler,
  GetClassesHandler,
  GetInstructorClassesHandler,
  GetStudentClassesHandler,
  // Roster
  GetClassRosterHandler,
  // Attendance
  GetClassAttendanceHandler,
  GetStudentAttendanceHandler,
  // Lesson Unlock
  GetUnlockedLessonsHandler,
  // Credit
  GetCreditHistoryHandler,
  // Package
  GetPackageInfoHandler,
  // Enrollment
  GetEnrollmentsHandler,
  GetEnrollmentHandler,
  GetEnrollmentStatsHandler,
];
