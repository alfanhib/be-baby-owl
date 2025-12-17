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
];
