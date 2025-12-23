export class GetFinancialReportQuery {
  constructor(
    public readonly period?: 'month' | 'quarter' | 'year',
    public readonly startDate?: Date,
    public readonly endDate?: Date,
  ) {}
}
