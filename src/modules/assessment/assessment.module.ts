import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '@shared/infrastructure/prisma/prisma.module';
import { EventBusModule } from '@shared/infrastructure/event-bus/event-bus.module';

// Domain
import { SUBMISSION_REPOSITORY } from './domain/repositories/submission.repository.interface';

// Application
import { CommandHandlers } from './application/commands';
import { QueryHandlers } from './application/queries';

// Infrastructure
import { SubmissionRepository } from './infrastructure/persistence/submission.repository';

// Interface
import { SubmissionsController } from './interfaces/http/controllers/submissions.controller';

@Module({
  imports: [CqrsModule, PrismaModule, EventBusModule],
  controllers: [SubmissionsController],
  providers: [
    // Repository
    {
      provide: SUBMISSION_REPOSITORY,
      useClass: SubmissionRepository,
    },
    // Command & Query Handlers
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [SUBMISSION_REPOSITORY],
})
export class AssessmentModule {}
