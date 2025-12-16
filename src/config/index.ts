export * from './app.config';
export * from './database.config';
export * from './redis.config';
export * from './jwt.config';
export * from './email.config';
export * from './storage.config';
export * from './throttle.config';

import { appConfig } from './app.config';
import { databaseConfig } from './database.config';
import { redisConfig } from './redis.config';
import { jwtConfig } from './jwt.config';
import { emailConfig } from './email.config';
import { storageConfig } from './storage.config';
import { throttleConfig } from './throttle.config';

export const configurations = [
  appConfig,
  databaseConfig,
  redisConfig,
  jwtConfig,
  emailConfig,
  storageConfig,
  throttleConfig,
];
