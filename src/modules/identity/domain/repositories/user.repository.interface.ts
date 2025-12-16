import { User } from '@identity/domain/aggregates/user.aggregate';
import { UserId } from '@identity/domain/value-objects/user-id.vo';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface IUserRepository {
  /**
   * Find user by ID
   */
  findById(id: UserId): Promise<User | null>;

  /**
   * Find user by email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Save user (create or update)
   */
  save(user: User): Promise<void>;

  /**
   * Check if user exists by ID
   */
  exists(id: UserId): Promise<boolean>;

  /**
   * Check if email is already taken
   */
  emailExists(email: string): Promise<boolean>;

  /**
   * Delete user by ID
   */
  delete(id: UserId): Promise<void>;

  /**
   * Find all users with pagination and filters
   */
  findAll(params: {
    skip?: number;
    take?: number;
    role?: string;
    status?: string;
    search?: string;
  }): Promise<{ users: User[]; total: number }>;
}
