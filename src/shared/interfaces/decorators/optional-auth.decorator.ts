import { SetMetadata } from '@nestjs/common';

export const IS_OPTIONAL_AUTH_KEY = 'isOptionalAuth';

/**
 * Decorator to mark an endpoint as optionally authenticated.
 * When used with JwtAuthGuard, the endpoint will work for both
 * authenticated and unauthenticated users.
 */
export const OptionalAuth = () => SetMetadata(IS_OPTIONAL_AUTH_KEY, true);

