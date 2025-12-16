export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER');

export interface IPasswordHasher {
  /**
   * Hash a plain text password
   */
  hash(plainPassword: string): Promise<string>;

  /**
   * Compare a plain text password with a hashed password
   */
  compare(plainPassword: string, hashedPassword: string): Promise<boolean>;
}
