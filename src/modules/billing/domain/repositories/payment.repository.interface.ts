import { Payment } from '../aggregates/payment.aggregate';
import { PaymentId } from '../value-objects/payment-id.vo';

export const PAYMENT_REPOSITORY = Symbol('PAYMENT_REPOSITORY');

export interface PaymentFilters {
  status?: string;
  method?: string;
  courseId?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface PaginatedPayments {
  data: Payment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaymentStats {
  total: number;
  totalAmount: number;
  byStatus: {
    pending: { count: number; amount: number };
    verified: { count: number; amount: number };
    rejected: { count: number; amount: number };
    refunded: { count: number; amount: number };
  };
  thisMonth: {
    count: number;
    amount: number;
    verifiedAmount: number;
  };
  pendingVerification: number;
}

export interface IPaymentRepository {
  findById(id: PaymentId): Promise<Payment | null>;
  findAll(
    filters: PaymentFilters,
    page: number,
    limit: number,
  ): Promise<PaginatedPayments>;
  findByCourseId(courseId: string): Promise<Payment[]>;
  findByStudentEmail(email: string): Promise<Payment[]>;
  save(payment: Payment): Promise<void>;
  delete(id: PaymentId): Promise<void>;
  getStats(): Promise<PaymentStats>;
}
