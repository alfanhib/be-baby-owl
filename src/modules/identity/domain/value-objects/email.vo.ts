import { ValueObject } from '@shared/domain/value-object.base';
import { InvalidEmailError } from '../errors/invalid-email.error';

interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  private static readonly EMAIL_REGEX =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  private constructor(props: EmailProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static create(email: string): Email {
    const normalized = email.toLowerCase().trim();

    if (!this.isValid(normalized)) {
      throw new InvalidEmailError(email);
    }

    return new Email({ value: normalized });
  }

  private static isValid(email: string): boolean {
    return this.EMAIL_REGEX.test(email);
  }

  toString(): string {
    return this.props.value;
  }
}
