export * from './get-staff-dashboard';
export * from './search-students';
export * from './get-available-classes';
export * from './get-enrollment-history';
export * from './get-enrollment-analytics';

import { GetStaffDashboardHandler } from './get-staff-dashboard';
import { SearchStudentsHandler } from './search-students';
import { GetAvailableClassesHandler } from './get-available-classes';
import { GetEnrollmentHistoryHandler } from './get-enrollment-history';
import { GetEnrollmentAnalyticsHandler } from './get-enrollment-analytics';

export const QueryHandlers = [
  GetStaffDashboardHandler,
  SearchStudentsHandler,
  GetAvailableClassesHandler,
  GetEnrollmentHistoryHandler,
  GetEnrollmentAnalyticsHandler,
];
