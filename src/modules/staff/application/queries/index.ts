export * from './get-staff-dashboard';
export * from './search-students';
export * from './get-available-classes';

import { GetStaffDashboardHandler } from './get-staff-dashboard';
import { SearchStudentsHandler } from './search-students';
import { GetAvailableClassesHandler } from './get-available-classes';

export const QueryHandlers = [
  GetStaffDashboardHandler,
  SearchStudentsHandler,
  GetAvailableClassesHandler,
];
