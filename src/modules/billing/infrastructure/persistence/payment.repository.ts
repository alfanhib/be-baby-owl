import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import {
  IPaymentRepository,
  PaymentFilters,
  PaginatedPayments,
  PaymentStats,
} from '@billing/domain/repositories/payment.repository.interface';
import { Payment } from '@billing/domain/aggregates/payment.aggregate';
import { PaymentId } from '@billing/domain/value-objects/payment-id.vo';
import { PaymentMapper } from './payment.mapper';
import { Prisma } from '@prisma/client';

@Injectable()
export class PaymentRepository implements IPaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: PaymentId): Promise<Payment | null> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: id.value },
    });

    if (!payment) return null;

    return PaymentMapper.toDomain(payment);
  }

  async findAll(
    filters: PaymentFilters,
    page: number,
    limit: number,
  ): Promise<PaginatedPayments> {
    const where: Prisma.PaymentWhereInput = {};

    if (filters.status) {
      where.status = filters.status as 'pending' | 'verified' | 'refunded';
    }

    if (filters.method) {
      where.paymentMethod = filters.method;
    }

    if (filters.courseId) {
      where.courseId = filters.courseId;
    }

    if (filters.search) {
      where.OR = [
        { studentName: { contains: filters.search, mode: 'insensitive' } },
        { studentEmail: { contains: filters.search, mode: 'insensitive' } },
        { paymentRef: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: payments.map((p) => PaymentMapper.toDomain(p)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAllForExport(filters: PaymentFilters): Promise<Payment[]> {
    const where: Prisma.PaymentWhereInput = {};

    if (filters.status) {
      where.status = filters.status as 'pending' | 'verified' | 'refunded';
    }

    if (filters.method) {
      where.paymentMethod = filters.method;
    }

    if (filters.courseId) {
      where.courseId = filters.courseId;
    }

    if (filters.search) {
      where.OR = [
        { studentName: { contains: filters.search, mode: 'insensitive' } },
        { studentEmail: { contains: filters.search, mode: 'insensitive' } },
        { paymentRef: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const payments = await this.prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return payments.map((p) => PaymentMapper.toDomain(p));
  }

  async findByCourseId(courseId: string): Promise<Payment[]> {
    const payments = await this.prisma.payment.findMany({
      where: { courseId },
      orderBy: { createdAt: 'desc' },
    });

    return payments.map((p) => PaymentMapper.toDomain(p));
  }

  async findByStudentEmail(email: string): Promise<Payment[]> {
    const payments = await this.prisma.payment.findMany({
      where: { studentEmail: email },
      orderBy: { createdAt: 'desc' },
    });

    return payments.map((p) => PaymentMapper.toDomain(p));
  }

  async save(payment: Payment): Promise<void> {
    const data = PaymentMapper.toPrisma(payment);

    await this.prisma.payment.upsert({
      where: { id: data.id },
      create: {
        id: data.id,
        studentName: data.studentName,
        studentEmail: data.studentEmail,
        studentPhone: data.studentPhone,
        courseId: data.courseId,
        packageType: data.packageType,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        paymentRef: data.paymentRef,
        status: data.status as 'pending' | 'verified' | 'refunded',
        notes: data.notes,
        verifiedById: data.verifiedById,
        verifiedAt: data.verifiedAt,
      },
      update: {
        studentName: data.studentName,
        studentEmail: data.studentEmail,
        studentPhone: data.studentPhone,
        courseId: data.courseId,
        packageType: data.packageType,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        paymentRef: data.paymentRef,
        status: data.status as 'pending' | 'verified' | 'refunded',
        notes: data.notes,
        verifiedById: data.verifiedById,
        verifiedAt: data.verifiedAt,
      },
    });
  }

  async delete(id: PaymentId): Promise<void> {
    await this.prisma.payment.delete({
      where: { id: id.value },
    });
  }

  async getStats(): Promise<PaymentStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [allPayments, thisMonthPayments] = await Promise.all([
      this.prisma.payment.groupBy({
        by: ['status'],
        _count: { id: true },
        _sum: { amount: true },
      }),
      this.prisma.payment.findMany({
        where: {
          createdAt: { gte: startOfMonth },
        },
        select: {
          status: true,
          amount: true,
        },
      }),
    ]);

    const byStatus = {
      pending: { count: 0, amount: 0 },
      verified: { count: 0, amount: 0 },
      rejected: { count: 0, amount: 0 },
      refunded: { count: 0, amount: 0 },
    };

    let total = 0;
    let totalAmount = 0;

    for (const group of allPayments) {
      const status = group.status as keyof typeof byStatus;
      if (byStatus[status] !== undefined) {
        byStatus[status].count = group._count.id;
        byStatus[status].amount = Number(group._sum.amount) || 0;
      }
      total += group._count.id;
      totalAmount += Number(group._sum.amount) || 0;
    }

    const thisMonth = {
      count: thisMonthPayments.length,
      amount: thisMonthPayments.reduce((sum, p) => sum + Number(p.amount), 0),
      verifiedAmount: thisMonthPayments
        .filter((p) => p.status === 'verified')
        .reduce((sum, p) => sum + Number(p.amount), 0),
    };

    return {
      total,
      totalAmount,
      byStatus,
      thisMonth,
      pendingVerification: byStatus.pending.count,
    };
  }
}
