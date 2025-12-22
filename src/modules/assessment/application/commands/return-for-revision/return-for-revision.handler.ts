import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ReturnForRevisionCommand } from './return-for-revision.command';
import {
  ISubmissionRepository,
  SUBMISSION_REPOSITORY,
} from '@assessment/domain/repositories/submission.repository.interface';
import { SubmissionId } from '@assessment/domain/value-objects/submission-id.vo';
import { SubmissionNotFoundError } from '@assessment/domain/errors';

@CommandHandler(ReturnForRevisionCommand)
export class ReturnForRevisionHandler
  implements ICommandHandler<ReturnForRevisionCommand>
{
  constructor(
    @Inject(SUBMISSION_REPOSITORY)
    private readonly submissionRepository: ISubmissionRepository,
  ) {}

  async execute(command: ReturnForRevisionCommand): Promise<void> {
    const submission = await this.submissionRepository.findById(
      SubmissionId.create(command.submissionId),
    );

    if (!submission) {
      throw new SubmissionNotFoundError(command.submissionId);
    }

    submission.returnForRevision(command.returnedById, command.feedback);

    await this.submissionRepository.save(submission);
  }
}

