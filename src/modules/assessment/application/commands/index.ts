import { SubmitAssignmentHandler } from './submit-assignment/submit-assignment.handler';
import { GradeSubmissionHandler } from './grade-submission/grade-submission.handler';
import { BulkGradeSubmissionsHandler } from './bulk-grade-submissions/bulk-grade-submissions.handler';
import { ReturnForRevisionHandler } from './return-for-revision/return-for-revision.handler';

export const CommandHandlers = [
  SubmitAssignmentHandler,
  GradeSubmissionHandler,
  BulkGradeSubmissionsHandler,
  ReturnForRevisionHandler,
];

export * from './submit-assignment/submit-assignment.command';
export * from './submit-assignment/submit-assignment.handler';
export * from './grade-submission/grade-submission.command';
export * from './grade-submission/grade-submission.handler';
export * from './bulk-grade-submissions/bulk-grade-submissions.command';
export * from './bulk-grade-submissions/bulk-grade-submissions.handler';
export * from './return-for-revision/return-for-revision.command';
export * from './return-for-revision/return-for-revision.handler';
