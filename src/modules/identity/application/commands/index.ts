export * from './register-user';
export * from './login';
export * from './refresh-token';
export * from './logout';
export * from './verify-email';
export * from './change-password';
export * from './update-profile';

import { RegisterUserHandler } from './register-user';
import { LoginHandler } from './login';
import { RefreshTokenHandler } from './refresh-token';
import { LogoutHandler } from './logout';
import { VerifyEmailHandler } from './verify-email';
import { ChangePasswordHandler } from './change-password';
import { UpdateProfileHandler } from './update-profile';

export const CommandHandlers = [
  RegisterUserHandler,
  LoginHandler,
  RefreshTokenHandler,
  LogoutHandler,
  VerifyEmailHandler,
  ChangePasswordHandler,
  UpdateProfileHandler,
];
