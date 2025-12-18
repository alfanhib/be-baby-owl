import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetPaymentQuery } from './get-payment.query';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '@billing/domain/repositories/payment.repository.interface';
import { PaymentId } from '@billing/domain/value-objects/payment-id.vo';
import { PaymentNotFoundError } from '@billing/domain/errors';
import { PaymentDto } from './payment.dto';

@QueryHandler(GetPaymentQuery)
export class GetPaymentHandler implements IQueryHandler<GetPaymentQuery> {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(query: GetPaymentQuery): Promise<PaymentDto> {
    const paymentId = PaymentId.create(query.paymentId);
    const payment = await this.paymentRepository.findById(paymentId);

    if (!payment) {
      throw new PaymentNotFoundError(query.paymentId);
    }

    return PaymentDto.fromDomain(payment);
  }
}
