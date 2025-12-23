export class GetEnrollmentAnalyticsQuery {
  constructor(
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly courseId?: string,
  ) {}
}
