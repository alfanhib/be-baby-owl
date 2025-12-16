import { AggregateRoot } from './aggregate-root.base';

/**
 * Base Repository Interface
 * All repositories should implement this interface
 */
export interface IRepository<TAggregate extends AggregateRoot<TId>, TId> {
  /**
   * Find aggregate by ID
   */
  findById(id: TId): Promise<TAggregate | null>;

  /**
   * Save aggregate (create or update)
   */
  save(aggregate: TAggregate): Promise<void>;

  /**
   * Check if aggregate exists by ID
   */
  exists(id: TId): Promise<boolean>;

  /**
   * Delete aggregate by ID
   */
  delete(id: TId): Promise<void>;
}
