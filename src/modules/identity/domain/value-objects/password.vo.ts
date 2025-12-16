import { ValueObject } from '@shared/domain/value-object.base';
import { WeakPasswordError } from '../errors/weak-password.error';

interface PasswordProps {
  value: string;
  isHashed: boolean;
}

export class Password extends ValueObject<PasswordProps> {
  private static readonly MIN_LENGTH = 8;
  private static readonly HAS_UPPERCASE = /[A-Z]/;
  private static readonly HAS_LOWERCASE = /[a-z]/;
  private static readonly HAS_NUMBER = /\d/;
  private static readonly HAS_SPECIAL = /[!@#$%^&*(),.?":{}|<>]/;

  private constructor(props: PasswordProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  get isHashed(): boolean {
    return this.props.isHashed;
  }

  /**
   * Create a new password from plain text (for validation before hashing)
   */
  static createFromPlain(plainPassword: string): Password {
    const validationResult = this.validate(plainPassword);

    if (!validationResult.isValid) {
      throw new WeakPasswordError(validationResult.errors);
    }

    return new Password({ value: plainPassword, isHashed: false });
  }

  /**
   * Create a password from an already hashed value (from database)
   */
  static createFromHashed(hashedPassword: string): Password {
    return new Password({ value: hashedPassword, isHashed: true });
  }

  /**
   * Validate password strength
   */
  private static validate(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < this.MIN_LENGTH) {
      errors.push(`Password must be at least ${this.MIN_LENGTH} characters`);
    }

    if (!this.HAS_UPPERCASE.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!this.HAS_LOWERCASE.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!this.HAS_NUMBER.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!this.HAS_SPECIAL.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
