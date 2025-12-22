export * from './quick-enroll';
export * from './bulk-enroll';

import { QuickEnrollHandler } from './quick-enroll';
import { BulkEnrollHandler } from './bulk-enroll';

export const CommandHandlers = [QuickEnrollHandler, BulkEnrollHandler];
