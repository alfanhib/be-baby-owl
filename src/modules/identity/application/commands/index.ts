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
export * from './forgot-password';
export * from './reset-password';
export * from './request-verification-email';
export * from './regenerate-invite';
export * from './setup-password';

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
import { ForgotPasswordHandler } from './forgot-password';
import { ResetPasswordHandler } from './reset-password';
import { RequestVerificationEmailHandler } from './request-verification-email';
import { RegenerateInviteHandler } from './regenerate-invite';
import { SetupPasswordHandler } from './setup-password';

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
  ForgotPasswordHandler,
  ResetPasswordHandler,
  RequestVerificationEmailHandler,
  RegenerateInviteHandler,
  SetupPasswordHandler,
];
