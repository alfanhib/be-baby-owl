import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetPaymentStatsQuery } from './get-payment-stats.query';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
  PaymentStats,
} from '@billing/domain/repositories/payment.repository.interface';

@QueryHandler(GetPaymentStatsQuery)
export class GetPaymentStatsHandler implements IQueryHandler<GetPaymentStatsQuery> {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(_query: GetPaymentStatsQuery): Promise<PaymentStats> {
    return this.paymentRepository.getStats();
  }
}
