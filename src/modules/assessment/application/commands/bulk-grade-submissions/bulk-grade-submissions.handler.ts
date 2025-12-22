import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { BulkGradeSubmissionsCommand } from './bulk-grade-submissions.command';
import {
  ISubmissionRepository,
  SUBMISSION_REPOSITORY,
} from '@assessment/domain/repositories/submission.repository.interface';
import { SubmissionId } from '@assessment/domain/value-objects/submission-id.vo';

interface BulkGradeResult {
  success: string[];
  failed: Array<{ submissionId: string; error: string }>;
}

@CommandHandler(BulkGradeSubmissionsCommand)
export class BulkGradeSubmissionsHandler
  implements ICommandHandler<BulkGradeSubmissionsCommand>
{
  constructor(
    @Inject(SUBMISSION_REPOSITORY)
    private readonly submissionRepository: ISubmissionRepository,
  ) {}

  async execute(command: BulkGradeSubmissionsCommand): Promise<BulkGradeResult> {
    const result: BulkGradeResult = {
      success: [],
      failed: [],
    };

    for (const entry of command.entries) {
      try {
        const submission = await this.submissionRepository.findById(
          SubmissionId.create(entry.submissionId),
        );

        if (!submission) {
          result.failed.push({
            submissionId: entry.submissionId,
            error: 'Submission not found',
          });
          continue;
        }

        submission.gradeSubmission(
          command.gradedById,
          entry.score,
          entry.maxScore,
          entry.feedback,
        );

        await this.submissionRepository.save(submission);
        result.success.push(entry.submissionId);
      } catch (error) {
        result.failed.push({
          submissionId: entry.submissionId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return result;
  }
}

