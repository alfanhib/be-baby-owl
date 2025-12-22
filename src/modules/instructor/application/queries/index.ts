export * from './get-instructor-dashboard';
export * from './get-instructor-classes';
export * from './get-class-students';
export * from './get-at-risk-students';
export * from './get-instructor-analytics';

import { GetInstructorDashboardHandler } from './get-instructor-dashboard';
import { GetInstructorClassesHandler } from './get-instructor-classes';
import { GetClassStudentsHandler } from './get-class-students';
import { GetAtRiskStudentsHandler } from './get-at-risk-students';
import { GetInstructorAnalyticsHandler } from './get-instructor-analytics';

export const QueryHandlers = [
  GetInstructorDashboardHandler,
  GetInstructorClassesHandler,
  GetClassStudentsHandler,
  GetAtRiskStudentsHandler,
  GetInstructorAnalyticsHandler,
];
