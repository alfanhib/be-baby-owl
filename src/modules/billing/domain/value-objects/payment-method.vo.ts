import { ValueObject } from '@shared/domain/value-object.base';

export enum PaymentMethodEnum {
  BANK_TRANSFER = 'bank_transfer',
  E_WALLET = 'e_wallet',
  CREDIT_CARD = 'credit_card',
  CASH = 'cash',
  OTHER = 'other',
}

interface PaymentMethodProps {
  value: PaymentMethodEnum;
}

export class PaymentMethod extends ValueObject<PaymentMethodProps> {
  private constructor(props: PaymentMethodProps) {
    super(props);
  }

  get value(): PaymentMethodEnum {
    return this.props.value;
  }

  static create(value: string): PaymentMethod {
    const normalized = value.toLowerCase() as PaymentMethodEnum;
    if (!Object.values(PaymentMethodEnum).includes(normalized)) {
      throw new Error(`Invalid payment method: ${value}`);
    }
    return new PaymentMethod({ value: normalized });
  }

  static bankTransfer(): PaymentMethod {
    return new PaymentMethod({ value: PaymentMethodEnum.BANK_TRANSFER });
  }

  static eWallet(): PaymentMethod {
    return new PaymentMethod({ value: PaymentMethodEnum.E_WALLET });
  }

  static creditCard(): PaymentMethod {
    return new PaymentMethod({ value: PaymentMethodEnum.CREDIT_CARD });
  }

  static cash(): PaymentMethod {
    return new PaymentMethod({ value: PaymentMethodEnum.CASH });
  }

  static other(): PaymentMethod {
    return new PaymentMethod({ value: PaymentMethodEnum.OTHER });
  }

  isBankTransfer(): boolean {
    return this.props.value === PaymentMethodEnum.BANK_TRANSFER;
  }

  isEWallet(): boolean {
    return this.props.value === PaymentMethodEnum.E_WALLET;
  }

  isCreditCard(): boolean {
    return this.props.value === PaymentMethodEnum.CREDIT_CARD;
  }

  isCash(): boolean {
    return this.props.value === PaymentMethodEnum.CASH;
  }
}
