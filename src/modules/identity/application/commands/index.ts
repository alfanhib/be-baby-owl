export * from './register-user';
export * from './login';
export * from './refresh-token';
export * from './logout';
export * from './verify-email';
export * from './change-password';
export * from './update-profile';
export * from './create-user';
export * from './update-user';
export * from './deactivate-user';
export * from './change-user-role';

import { RegisterUserHandler } from './register-user';
import { LoginHandler } from './login';
import { RefreshTokenHandler } from './refresh-token';
import { LogoutHandler } from './logout';
import { VerifyEmailHandler } from './verify-email';
import { ChangePasswordHandler } from './change-password';
import { UpdateProfileHandler } from './update-profile';
import { CreateUserHandler } from './create-user';
import { UpdateUserHandler } from './update-user';
import { DeactivateUserHandler } from './deactivate-user';
import { ChangeUserRoleHandler } from './change-user-role';

export const CommandHandlers = [
  RegisterUserHandler,
  LoginHandler,
  RefreshTokenHandler,
  LogoutHandler,
  VerifyEmailHandler,
  ChangePasswordHandler,
  UpdateProfileHandler,
  CreateUserHandler,
  UpdateUserHandler,
  DeactivateUserHandler,
  ChangeUserRoleHandler,
];
