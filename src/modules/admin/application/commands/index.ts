import { UpdateSystemConfigHandler } from './update-system-config/update-system-config.handler';
import { ForceResetPasswordHandler } from './force-reset-password/force-reset-password.handler';
import { ClearCacheHandler } from './clear-cache/clear-cache.handler';

export const CommandHandlers = [
  UpdateSystemConfigHandler,
  ForceResetPasswordHandler,
  ClearCacheHandler,
];

export * from './update-system-config/update-system-config.command';
export * from './update-system-config/update-system-config.handler';
export * from './force-reset-password/force-reset-password.command';
export * from './force-reset-password/force-reset-password.handler';
export * from './clear-cache/clear-cache.command';
export * from './clear-cache/clear-cache.handler';

