import { Payment as PrismaPayment } from '@prisma/client';
import { Payment } from '@billing/domain/aggregates/payment.aggregate';

export class PaymentMapper {
  static toDomain(prismaPayment: PrismaPayment): Payment {
    return Payment.restore(prismaPayment.id, {
      studentName: prismaPayment.studentName,
      studentEmail: prismaPayment.studentEmail,
      studentPhone: prismaPayment.studentPhone,
      courseId: prismaPayment.courseId,
      packageType: prismaPayment.packageType,
      amount: Number(prismaPayment.amount),
      method: prismaPayment.paymentMethod,
      reference: prismaPayment.paymentRef,
      proofUrl: null, // Not in current schema, would need migration
      status: prismaPayment.status,
      notes: prismaPayment.notes,
      paidAt: null, // Not in current schema
      verifiedBy: prismaPayment.verifiedById,
      verifiedAt: prismaPayment.verifiedAt,
      rejectedBy: null, // Not in current schema
      rejectedAt: null, // Not in current schema
      rejectionReason: null, // Not in current schema
      refundedBy: null, // Not in current schema
      refundedAt: null, // Not in current schema
      refundAmount: null, // Not in current schema
      refundReason: null, // Not in current schema
      createdAt: prismaPayment.createdAt,
      updatedAt: prismaPayment.createdAt, // Use createdAt as fallback
    });
  }

  static toPrisma(payment: Payment): {
    id: string;
    studentName: string | null;
    studentEmail: string | null;
    studentPhone: string | null;
    courseId: string | null;
    packageType: string | null;
    amount: number;
    paymentMethod: string | null;
    paymentRef: string | null;
    status: string;
    notes: string | null;
    verifiedById: string | null;
    verifiedAt: Date | null;
  } {
    return {
      id: payment.id.value,
      studentName: payment.studentName,
      studentEmail: payment.studentEmail,
      studentPhone: payment.studentPhone,
      courseId: payment.courseId,
      packageType: payment.packageType,
      amount: payment.amount.amount,
      paymentMethod: payment.method?.value ?? null,
      paymentRef: payment.reference,
      status: payment.status.value,
      notes: payment.notes,
      verifiedById: payment.verifiedBy,
      verifiedAt: payment.verifiedAt,
    };
  }
}
