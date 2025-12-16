import { Injectable, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { DomainEvent } from '@shared/domain/domain-event.base';
import { AggregateRoot } from '@shared/domain/aggregate-root.base';

/**
 * Integration Event for cross-context communication
 */
export class IntegrationEvent {
  constructor(
    public readonly eventName: string,
    public readonly payload: Record<string, unknown>,
    public readonly occurredOn: Date = new Date(),
  ) {}
}

@Injectable()
export class EventBusService {
  private readonly logger = new Logger(EventBusService.name);

  constructor(private readonly eventBus: EventBus) {}

  /**
   * Publish a single domain event
   */
  async publish(event: DomainEvent): Promise<void> {
    this.logger.debug(`Publishing event: ${event.eventName}`);
    await this.eventBus.publish(event);
  }

  /**
   * Publish multiple domain events
   */
  async publishAll(events: DomainEvent[]): Promise<void> {
    if (events.length === 0) return;

    this.logger.debug(`Publishing ${events.length} events`);
    for (const event of events) {
      await this.eventBus.publish(event);
    }
  }

  /**
   * Publish events from an aggregate and clear them
   */
  async publishFromAggregate<TId>(
    aggregate: AggregateRoot<TId>,
  ): Promise<void> {
    const events = aggregate.clearEvents();
    await this.publishAll(events);
  }

  /**
   * Publish an integration event for cross-context communication
   */
  async publishIntegration(event: IntegrationEvent): Promise<void> {
    this.logger.debug(`Publishing integration event: ${event.eventName}`);
    await this.eventBus.publish(event);
  }
}
