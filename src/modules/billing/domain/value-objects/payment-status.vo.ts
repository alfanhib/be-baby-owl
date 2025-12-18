import { ValueObject } from '@shared/domain/value-object.base';

export enum PaymentStatusEnum {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  REFUNDED = 'refunded',
}

interface PaymentStatusProps {
  value: PaymentStatusEnum;
}

export class PaymentStatus extends ValueObject<PaymentStatusProps> {
  private constructor(props: PaymentStatusProps) {
    super(props);
  }

  get value(): PaymentStatusEnum {
    return this.props.value;
  }

  static create(value: string): PaymentStatus {
    const normalized = value.toLowerCase() as PaymentStatusEnum;
    if (!Object.values(PaymentStatusEnum).includes(normalized)) {
      throw new Error(`Invalid payment status: ${value}`);
    }
    return new PaymentStatus({ value: normalized });
  }

  static pending(): PaymentStatus {
    return new PaymentStatus({ value: PaymentStatusEnum.PENDING });
  }

  static verified(): PaymentStatus {
    return new PaymentStatus({ value: PaymentStatusEnum.VERIFIED });
  }

  static rejected(): PaymentStatus {
    return new PaymentStatus({ value: PaymentStatusEnum.REJECTED });
  }

  static refunded(): PaymentStatus {
    return new PaymentStatus({ value: PaymentStatusEnum.REFUNDED });
  }

  isPending(): boolean {
    return this.props.value === PaymentStatusEnum.PENDING;
  }

  isVerified(): boolean {
    return this.props.value === PaymentStatusEnum.VERIFIED;
  }

  isRejected(): boolean {
    return this.props.value === PaymentStatusEnum.REJECTED;
  }

  isRefunded(): boolean {
    return this.props.value === PaymentStatusEnum.REFUNDED;
  }

  canVerify(): boolean {
    return this.isPending();
  }

  canReject(): boolean {
    return this.isPending();
  }

  canRefund(): boolean {
    return this.isVerified();
  }
}
