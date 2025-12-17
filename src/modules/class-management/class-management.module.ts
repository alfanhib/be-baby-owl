import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '@shared/infrastructure/prisma/prisma.module';
import { EventBusModule } from '@shared/infrastructure/event-bus/event-bus.module';

// Domain
import { CLASS_REPOSITORY } from './domain/repositories/class.repository.interface';

// Application
import { CommandHandlers } from './application/commands';
import { QueryHandlers } from './application/queries';

// Infrastructure
import { ClassRepository } from './infrastructure/persistence/class.repository';

// Interface
import { ClassesController } from './interfaces/http/controllers/classes.controller';

@Module({
  imports: [CqrsModule, PrismaModule, EventBusModule],
  controllers: [ClassesController],
  providers: [
    // Repository
    {
      provide: CLASS_REPOSITORY,
      useClass: ClassRepository,
    },
    // Command & Query Handlers
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [CLASS_REPOSITORY],
})
export class ClassManagementModule {}
