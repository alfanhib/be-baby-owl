export class GetEnrollmentHistoryQuery {
  constructor(
    public readonly classId?: string,
    public readonly studentId?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly page: number = 1,
    public readonly limit: number = 20,
  ) {}
}

