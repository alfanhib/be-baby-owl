import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SubmitAssignmentCommand } from './submit-assignment.command';
import {
  ISubmissionRepository,
  SUBMISSION_REPOSITORY,
} from '@assessment/domain/repositories/submission.repository.interface';
import { Submission } from '@assessment/domain/aggregates/submission.aggregate';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { ExerciseNotAssignmentError } from '@assessment/domain/errors';

@CommandHandler(SubmitAssignmentCommand)
export class SubmitAssignmentHandler
  implements ICommandHandler<SubmitAssignmentCommand>
{
  constructor(
    @Inject(SUBMISSION_REPOSITORY)
    private readonly submissionRepository: ISubmissionRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    command: SubmitAssignmentCommand,
  ): Promise<{ submissionId: string }> {
    // Verify exercise exists and is of type 'assignment'
    const exercise = await this.prisma.exercise.findUnique({
      where: { id: command.exerciseId },
    });

    if (!exercise) {
      throw new Error(`Exercise ${command.exerciseId} not found`);
    }

    if (exercise.type !== 'assignment') {
      throw new ExerciseNotAssignmentError(command.exerciseId);
    }

    // Check if student already has a submission - if so, resubmit instead
    const existingSubmission =
      await this.submissionRepository.findLatestByExerciseAndStudent(
        command.exerciseId,
        command.studentId,
      );

    if (existingSubmission) {
      // Resubmit
      existingSubmission.resubmit({
        type: command.type,
        fileUrl: command.fileUrl,
        fileName: command.fileName,
        fileSize: command.fileSize,
        textContent: command.textContent,
        linkUrl: command.linkUrl,
        comment: command.comment,
      });

      await this.submissionRepository.save(existingSubmission);
      return { submissionId: existingSubmission.id.value };
    }

    // Create new submission
    const submission = Submission.create({
      exerciseId: command.exerciseId,
      studentId: command.studentId,
      type: command.type,
      fileUrl: command.fileUrl,
      fileName: command.fileName,
      fileSize: command.fileSize,
      textContent: command.textContent,
      linkUrl: command.linkUrl,
      comment: command.comment,
    });

    await this.submissionRepository.save(submission);

    return { submissionId: submission.id.value };
  }
}

