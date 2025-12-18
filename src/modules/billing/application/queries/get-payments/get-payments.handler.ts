import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetPaymentsQuery } from './get-payments.query';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '@billing/domain/repositories/payment.repository.interface';
import { PaymentDto } from '../get-payment/payment.dto';

export interface PaginatedPaymentsResult {
  data: PaymentDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@QueryHandler(GetPaymentsQuery)
export class GetPaymentsHandler implements IQueryHandler<GetPaymentsQuery> {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(query: GetPaymentsQuery): Promise<PaginatedPaymentsResult> {
    const result = await this.paymentRepository.findAll(
      {
        status: query.status,
        method: query.method,
        courseId: query.courseId,
        search: query.search,
        startDate: query.startDate,
        endDate: query.endDate,
      },
      query.page,
      query.limit,
    );

    return {
      data: result.data.map((payment) => PaymentDto.fromDomain(payment)),
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  }
}
