import { Entity } from './entity.base';
import { DomainEvent } from './domain-event.base';

/**
 * Base Aggregate Root class
 * Aggregates are consistency boundaries that contain domain events
 */
export abstract class AggregateRoot<TId> extends Entity<TId> {
  private _domainEvents: DomainEvent[] = [];
  private _version: number = 0;

  constructor(id: TId, createdAt?: Date, updatedAt?: Date, version?: number) {
    super(id, createdAt, updatedAt);
    this._version = version ?? 0;
  }

  /**
   * Get all uncommitted domain events
   */
  get domainEvents(): ReadonlyArray<DomainEvent> {
    return Object.freeze([...this._domainEvents]);
  }

  /**
   * Version for optimistic locking
   */
  get version(): number {
    return this._version;
  }

  /**
   * Add a domain event to the aggregate
   */
  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * Clear and return all domain events
   * Call this after persisting the aggregate
   */
  clearEvents(): DomainEvent[] {
    const events: DomainEvent[] = this._domainEvents.slice();
    this._domainEvents = [];
    return events;
  }

  /**
   * Check if there are uncommitted events
   */
  hasUncommittedEvents(): boolean {
    return this._domainEvents.length > 0;
  }

  /**
   * Increment version after successful save
   */
  incrementVersion(): void {
    this._version++;
  }
}
