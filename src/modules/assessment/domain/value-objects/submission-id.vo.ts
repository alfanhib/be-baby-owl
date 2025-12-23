import { randomUUID } from 'crypto';

export class SubmissionId {
  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value;
  }

  static create(id?: string): SubmissionId {
    return new SubmissionId(id ?? randomUUID());
  }

  equals(other: SubmissionId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
