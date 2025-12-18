import { ValueObject } from '@shared/domain/value-object.base';

interface MoneyProps {
  amount: number;
  currency: string;
}

export class Money extends ValueObject<MoneyProps> {
  private constructor(props: MoneyProps) {
    super(props);
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  static create(amount: number, currency: string = 'IDR'): Money {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    return new Money({ amount, currency: currency.toUpperCase() });
  }

  static zero(currency: string = 'IDR'): Money {
    return new Money({ amount: 0, currency: currency.toUpperCase() });
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add money with different currencies');
    }
    return new Money({
      amount: this.amount + other.amount,
      currency: this.currency,
    });
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot subtract money with different currencies');
    }
    if (this.amount < other.amount) {
      throw new Error('Cannot subtract: would result in negative amount');
    }
    return new Money({
      amount: this.amount - other.amount,
      currency: this.currency,
    });
  }

  isGreaterThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new Error('Cannot compare money with different currencies');
    }
    return this.amount > other.amount;
  }

  isLessThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new Error('Cannot compare money with different currencies');
    }
    return this.amount < other.amount;
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  format(): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: this.currency,
    }).format(this.amount);
  }
}
