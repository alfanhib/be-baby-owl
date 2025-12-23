export class GetCoursePerformanceQuery {
  constructor(
    public readonly startDate?: Date,
    public readonly endDate?: Date,
  ) {}
}
