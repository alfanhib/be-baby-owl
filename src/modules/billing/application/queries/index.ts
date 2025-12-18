import { GetPaymentHandler } from './get-payment/get-payment.handler';
import { GetPaymentsHandler } from './get-payments/get-payments.handler';
import { GetPaymentStatsHandler } from './get-payment-stats/get-payment-stats.handler';

export const QueryHandlers = [
  GetPaymentHandler,
  GetPaymentsHandler,
  GetPaymentStatsHandler,
];

export * from './get-payment';
export * from './get-payments';
export * from './get-payment-stats';
