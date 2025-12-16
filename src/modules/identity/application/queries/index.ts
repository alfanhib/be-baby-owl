export * from './get-user-by-id';
export * from './get-user-profile';
export * from './get-users-list';
export * from './check-email-exists';

import { GetUserByIdHandler } from './get-user-by-id';
import { GetUserProfileHandler } from './get-user-profile';
import { GetUsersListHandler } from './get-users-list';
import { CheckEmailExistsHandler } from './check-email-exists';

export const QueryHandlers = [
  GetUserByIdHandler,
  GetUserProfileHandler,
  GetUsersListHandler,
  CheckEmailExistsHandler,
];
