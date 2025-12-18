import { ValueObject } from '@/shared/domain';

interface XpAmountProps {
  value: number;
}

export class XpAmount extends ValueObject<XpAmountProps> {
  private constructor(props: XpAmountProps) {
    super(props);
  }

  get value(): number {
    return this.props.value;
  }

  public static create(amount: number): XpAmount {
    if (amount < 0) {
      throw new Error('XP amount cannot be negative');
    }
    return new XpAmount({ value: Math.floor(amount) });
  }

  public static zero(): XpAmount {
    return new XpAmount({ value: 0 });
  }

  public add(other: XpAmount): XpAmount {
    return XpAmount.create(this.value + other.value);
  }

  public subtract(other: XpAmount): XpAmount {
    const result = this.value - other.value;
    return XpAmount.create(Math.max(0, result));
  }

  public isGreaterThan(other: XpAmount): boolean {
    return this.value > other.value;
  }

  public isGreaterThanOrEqual(other: XpAmount): boolean {
    return this.value >= other.value;
  }
}
