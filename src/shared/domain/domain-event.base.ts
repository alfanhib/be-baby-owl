import { randomUUID } from 'crypto';

/**
 * Base Domain Event class
 * All domain events should extend this class
 */
export abstract class DomainEvent {
  public readonly eventId: string;
  public readonly occurredOn: Date;
  public readonly eventName: string;

  constructor() {
    this.eventId = randomUUID();
    this.occurredOn = new Date();
    this.eventName = this.constructor.name;
  }

  /**
   * Convert event to a plain object for serialization
   */
  abstract toPayload(): Record<string, unknown>;

  /**
   * Get event metadata
   */
  getMetadata(): EventMetadata {
    return {
      eventId: this.eventId,
      eventName: this.eventName,
      occurredOn: this.occurredOn.toISOString(),
    };
  }
}

export interface EventMetadata {
  eventId: string;
  eventName: string;
  occurredOn: string;
}
