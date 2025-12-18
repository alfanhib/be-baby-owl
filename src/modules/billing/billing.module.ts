import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '@shared/infrastructure/prisma/prisma.module';
import { EventBusModule } from '@shared/infrastructure/event-bus/event-bus.module';

// Domain
import { PAYMENT_REPOSITORY } from './domain/repositories/payment.repository.interface';

// Application
import { CommandHandlers } from './application/commands';
import { QueryHandlers } from './application/queries';

// Infrastructure
import { PaymentRepository } from './infrastructure/persistence/payment.repository';

// Interface
import { PaymentsController } from './interfaces/http/controllers/payments.controller';

@Module({
  imports: [CqrsModule, PrismaModule, EventBusModule],
  controllers: [PaymentsController],
  providers: [
    // Repository
    {
      provide: PAYMENT_REPOSITORY,
      useClass: PaymentRepository,
    },
    // Command & Query Handlers
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [PAYMENT_REPOSITORY],
})
export class BillingModule {}
