import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EventBusService } from './event-bus.service';

@Global()
@Module({
  imports: [CqrsModule],
  providers: [EventBusService],
  exports: [EventBusService, CqrsModule],
})
export class EventBusModule {}
