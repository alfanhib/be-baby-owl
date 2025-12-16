import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '@shared/infrastructure/prisma/prisma.module';
import { EventBusModule } from '@shared/infrastructure/event-bus/event-bus.module';

// Domain
import { COURSE_REPOSITORY } from './domain/repositories/course.repository.interface';

// Application
import { CommandHandlers } from './application/commands';
import { QueryHandlers } from './application/queries';

// Infrastructure
import { CourseRepository } from './infrastructure/persistence/course.repository';

// Interfaces
import { CoursesController } from './interfaces/http/controllers/courses.controller';

@Module({
  imports: [CqrsModule, PrismaModule, EventBusModule],
  controllers: [CoursesController],
  providers: [
    // Repository
    {
      provide: COURSE_REPOSITORY,
      useClass: CourseRepository,
    },

    // Command Handlers
    ...CommandHandlers,

    // Query Handlers
    ...QueryHandlers,
  ],
  exports: [COURSE_REPOSITORY],
})
export class LearningModule {}
