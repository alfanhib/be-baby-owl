import { ValueObject } from '@shared/domain/value-object.base';

interface MeetingCreditProps {
  total: number;
  used: number;
}

export class MeetingCredit extends ValueObject<MeetingCreditProps> {
  private constructor(props: MeetingCreditProps) {
    super(props);
  }

  get total(): number {
    return this.props.total;
  }

  get used(): number {
    return this.props.used;
  }

  get remaining(): number {
    return this.props.total - this.props.used;
  }

  get percentageUsed(): number {
    if (this.props.total === 0) return 0;
    return Math.round((this.props.used / this.props.total) * 100);
  }

  static create(total: number, used: number = 0): MeetingCredit {
    if (total < 0) {
      throw new Error('Total credits cannot be negative');
    }
    if (used < 0) {
      throw new Error('Used credits cannot be negative');
    }
    if (used > total) {
      throw new Error('Used credits cannot exceed total credits');
    }
    return new MeetingCredit({ total, used });
  }

  useCredit(): MeetingCredit {
    if (this.props.used >= this.props.total) {
      throw new Error('No credits remaining');
    }
    return new MeetingCredit({
      total: this.props.total,
      used: this.props.used + 1,
    });
  }

  addCredits(amount: number): MeetingCredit {
    if (amount < 0) {
      throw new Error('Cannot add negative credits');
    }
    return new MeetingCredit({
      total: this.props.total + amount,
      used: this.props.used,
    });
  }

  adjustCredits(amount: number): MeetingCredit {
    const newTotal = this.props.total + amount;
    if (newTotal < this.props.used) {
      throw new Error('Cannot reduce total below used credits');
    }
    return new MeetingCredit({
      total: newTotal,
      used: this.props.used,
    });
  }

  hasCredits(): boolean {
    return this.remaining > 0;
  }

  isExhausted(): boolean {
    return this.remaining === 0;
  }

  isLow(threshold: number = 3): boolean {
    return this.remaining > 0 && this.remaining <= threshold;
  }
}
