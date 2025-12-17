import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '@shared/infrastructure/prisma/prisma.module';
import { EventBusModule } from '@shared/infrastructure/event-bus/event-bus.module';

// Domain
import { COURSE_REPOSITORY } from './domain/repositories/course.repository.interface';
import { PROGRESS_REPOSITORY } from './domain/repositories/progress.repository.interface';

// Application
import { CommandHandlers } from './application/commands';
import { QueryHandlers } from './application/queries';

// Infrastructure
import { CourseRepository } from './infrastructure/persistence/course.repository';
import { ProgressRepository } from './infrastructure/persistence/progress.repository';

// Interfaces
import { CoursesController } from './interfaces/http/controllers/courses.controller';
import { SectionsController } from './interfaces/http/controllers/sections.controller';
import { LessonsController } from './interfaces/http/controllers/lessons.controller';
import { ExercisesController } from './interfaces/http/controllers/exercises.controller';
import { ProgressController } from './interfaces/http/controllers/progress.controller';

@Module({
  imports: [CqrsModule, PrismaModule, EventBusModule],
  controllers: [
    CoursesController,
    SectionsController,
    LessonsController,
    ExercisesController,
    ProgressController,
  ],
  providers: [
    // Repositories
    {
      provide: COURSE_REPOSITORY,
      useClass: CourseRepository,
    },
    {
      provide: PROGRESS_REPOSITORY,
      useClass: ProgressRepository,
    },

    // Command Handlers
    ...CommandHandlers,

    // Query Handlers
    ...QueryHandlers,
  ],
  exports: [COURSE_REPOSITORY, PROGRESS_REPOSITORY],
})
export class LearningModule {}
