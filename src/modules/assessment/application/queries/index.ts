import { GetPendingSubmissionsHandler } from './get-pending-submissions/get-pending-submissions.handler';
import { GetStudentSubmissionsHandler } from './get-student-submissions/get-student-submissions.handler';
import { GetSubmissionDetailHandler } from './get-submission-detail/get-submission-detail.handler';
import { GetGradingStatsHandler } from './get-grading-stats/get-grading-stats.handler';

export const QueryHandlers = [
  GetPendingSubmissionsHandler,
  GetStudentSubmissionsHandler,
  GetSubmissionDetailHandler,
  GetGradingStatsHandler,
];

export * from './get-pending-submissions/get-pending-submissions.query';
export * from './get-pending-submissions/get-pending-submissions.handler';
export * from './get-student-submissions/get-student-submissions.query';
export * from './get-student-submissions/get-student-submissions.handler';
export * from './get-submission-detail/get-submission-detail.query';
export * from './get-submission-detail/get-submission-detail.handler';
export * from './get-grading-stats/get-grading-stats.query';
export * from './get-grading-stats/get-grading-stats.handler';

