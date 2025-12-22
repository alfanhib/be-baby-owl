export class GetInstructorAnalyticsQuery {
  constructor(
    public readonly instructorId: string,
    public readonly period: 'week' | 'month' | 'year' = 'month',
  ) {}
}
