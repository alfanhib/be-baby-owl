import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ExportPaymentsQuery } from './export-payments.query';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '@billing/domain/repositories/payment.repository.interface';
import { PaymentDto } from '../get-payment/payment.dto';

@QueryHandler(ExportPaymentsQuery)
export class ExportPaymentsHandler implements IQueryHandler<ExportPaymentsQuery> {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(query: ExportPaymentsQuery): Promise<string> {
    const payments = await this.paymentRepository.findAllForExport({
      status: query.status,
      method: query.method,
      courseId: query.courseId,
      search: query.search,
      startDate: query.startDate,
      endDate: query.endDate,
    });

    const dtos = payments.map((p) => PaymentDto.fromDomain(p));

    // CSV Headers
    const headers = [
      'ID',
      'Student Name',
      'Student Email',
      'Student Phone',
      'Course ID',
      'Package',
      'Amount',
      'Currency',
      'Method',
      'Reference',
      'Status',
      'Paid At',
      'Verified At',
      'Verified By',
      'Created At',
      'Notes',
    ];

    // Build CSV rows
    const rows = dtos.map((dto) =>
      [
        dto.id,
        this.escapeCsvValue(dto.studentName),
        this.escapeCsvValue(dto.studentEmail),
        this.escapeCsvValue(dto.studentPhone),
        dto.courseId ?? '',
        this.escapeCsvValue(dto.packageType),
        dto.amount.toString(),
        dto.currency,
        dto.method ?? '',
        this.escapeCsvValue(dto.reference),
        dto.status,
        dto.paidAt ?? '',
        dto.verifiedAt ?? '',
        dto.verifiedBy ?? '',
        dto.createdAt,
        this.escapeCsvValue(dto.notes),
      ].join(','),
    );

    return [headers.join(','), ...rows].join('\n');
  }

  private escapeCsvValue(value: string | null): string {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    if (
      stringValue.includes(',') ||
      stringValue.includes('"') ||
      stringValue.includes('\n')
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  }
}
