import { Identifier } from '@shared/domain/identifier.base';

export class PaymentId extends Identifier {
  private constructor(value: string) {
    super(value);
  }

  static create(value?: string): PaymentId {
    if (value) {
      if (!Identifier.isValidUUID(value)) {
        throw new Error('Invalid PaymentId format');
      }
      return new PaymentId(value);
    }
    return new PaymentId(Identifier.generateUUID());
  }
}
