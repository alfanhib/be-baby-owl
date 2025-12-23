export type SubmissionStatusType = 'pending' | 'graded' | 'returned';

export class SubmissionStatus {
  private static readonly VALID_STATUSES: SubmissionStatusType[] = [
    'pending',
    'graded',
    'returned',
  ];

  private constructor(private readonly _value: SubmissionStatusType) {}

  get value(): SubmissionStatusType {
    return this._value;
  }

  static create(status: string): SubmissionStatus {
    if (!this.VALID_STATUSES.includes(status as SubmissionStatusType)) {
      throw new Error(`Invalid submission status: ${status}`);
    }
    return new SubmissionStatus(status as SubmissionStatusType);
  }

  static pending(): SubmissionStatus {
    return new SubmissionStatus('pending');
  }

  static graded(): SubmissionStatus {
    return new SubmissionStatus('graded');
  }

  static returned(): SubmissionStatus {
    return new SubmissionStatus('returned');
  }

  isPending(): boolean {
    return this._value === 'pending';
  }

  isGraded(): boolean {
    return this._value === 'graded';
  }

  isReturned(): boolean {
    return this._value === 'returned';
  }

  canGrade(): boolean {
    return this._value === 'pending' || this._value === 'returned';
  }

  canReturn(): boolean {
    return this._value === 'pending' || this._value === 'graded';
  }

  equals(other: SubmissionStatus): boolean {
    return this._value === other._value;
  }
}
