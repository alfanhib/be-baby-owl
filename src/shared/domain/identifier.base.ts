import { randomUUID } from 'crypto';
import { ValueObject } from './value-object.base';

interface IdentifierProps {
  value: string;
}

/**
 * Base Identifier class for entity IDs
 * Encapsulates UUID generation and validation
 */
export abstract class Identifier extends ValueObject<IdentifierProps> {
  protected constructor(value: string) {
    super({ value });
  }

  get value(): string {
    return this.props.value;
  }

  /**
   * Generate a new UUID
   */
  protected static generateUUID(): string {
    return randomUUID();
  }

  /**
   * Validate UUID format
   */
  protected static isValidUUID(value: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  toString(): string {
    return this.props.value;
  }

  toJSON(): string {
    return this.props.value;
  }
}
