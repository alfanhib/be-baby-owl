import { Payment } from '@billing/domain/aggregates/payment.aggregate';

export class PaymentDto {
  id: string;
  studentName: string | null;
  studentEmail: string | null;
  studentPhone: string | null;
  courseId: string | null;
  packageType: string | null;
  amount: number;
  currency: string;
  method: string | null;
  reference: string | null;
  proofUrl: string | null;
  status: string;
  notes: string | null;
  paidAt: string | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  rejectedBy: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  refundedBy: string | null;
  refundedAt: string | null;
  refundAmount: number | null;
  refundReason: string | null;
  createdAt: string;
  updatedAt: string;

  static fromDomain(payment: Payment): PaymentDto {
    const dto = new PaymentDto();
    dto.id = payment.id.value;
    dto.studentName = payment.studentName;
    dto.studentEmail = payment.studentEmail;
    dto.studentPhone = payment.studentPhone;
    dto.courseId = payment.courseId;
    dto.packageType = payment.packageType;
    dto.amount = payment.amount.amount;
    dto.currency = payment.amount.currency;
    dto.method = payment.method?.value ?? null;
    dto.reference = payment.reference;
    dto.proofUrl = payment.proofUrl;
    dto.status = payment.status.value;
    dto.notes = payment.notes;
    dto.paidAt = payment.paidAt?.toISOString() ?? null;
    dto.verifiedBy = payment.verifiedBy;
    dto.verifiedAt = payment.verifiedAt?.toISOString() ?? null;
    dto.rejectedBy = payment.rejectedBy;
    dto.rejectedAt = payment.rejectedAt?.toISOString() ?? null;
    dto.rejectionReason = payment.rejectionReason;
    dto.refundedBy = payment.refundedBy;
    dto.refundedAt = payment.refundedAt?.toISOString() ?? null;
    dto.refundAmount = payment.refundAmount?.amount ?? null;
    dto.refundReason = payment.refundReason;
    dto.createdAt = payment.createdAt.toISOString();
    dto.updatedAt = payment.updatedAt.toISOString();
    return dto;
  }
}
