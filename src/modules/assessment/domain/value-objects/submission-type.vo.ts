export type SubmissionTypeValue = 'file' | 'text' | 'link';

export class SubmissionType {
  private static readonly VALID_TYPES: SubmissionTypeValue[] = [
    'file',
    'text',
    'link',
  ];

  private constructor(private readonly _value: SubmissionTypeValue) {}

  get value(): SubmissionTypeValue {
    return this._value;
  }

  static create(type: string): SubmissionType {
    if (!this.VALID_TYPES.includes(type as SubmissionTypeValue)) {
      throw new Error(`Invalid submission type: ${type}`);
    }
    return new SubmissionType(type as SubmissionTypeValue);
  }

  static file(): SubmissionType {
    return new SubmissionType('file');
  }

  static text(): SubmissionType {
    return new SubmissionType('text');
  }

  static link(): SubmissionType {
    return new SubmissionType('link');
  }

  isFile(): boolean {
    return this._value === 'file';
  }

  isText(): boolean {
    return this._value === 'text';
  }

  isLink(): boolean {
    return this._value === 'link';
  }

  equals(other: SubmissionType): boolean {
    return this._value === other._value;
  }
}
