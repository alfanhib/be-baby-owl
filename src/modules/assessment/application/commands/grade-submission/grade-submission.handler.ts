import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GradeSubmissionCommand } from './grade-submission.command';
import {
  ISubmissionRepository,
  SUBMISSION_REPOSITORY,
} from '@assessment/domain/repositories/submission.repository.interface';
import { SubmissionId } from '@assessment/domain/value-objects/submission-id.vo';
import { SubmissionNotFoundError } from '@assessment/domain/errors';

@CommandHandler(GradeSubmissionCommand)
export class GradeSubmissionHandler implements ICommandHandler<GradeSubmissionCommand> {
  constructor(
    @Inject(SUBMISSION_REPOSITORY)
    private readonly submissionRepository: ISubmissionRepository,
  ) {}

  async execute(command: GradeSubmissionCommand): Promise<void> {
    const submission = await this.submissionRepository.findById(
      SubmissionId.create(command.submissionId),
    );

    if (!submission) {
      throw new SubmissionNotFoundError(command.submissionId);
    }

    submission.gradeSubmission(
      command.gradedById,
      command.score,
      command.maxScore,
      command.feedback,
    );

    await this.submissionRepository.save(submission);
  }
}
