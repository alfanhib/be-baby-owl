export class GetAuditLogsQuery {
  constructor(
    public readonly userId?: string,
    public readonly action?: string,
    public readonly resource?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly page: number = 1,
    public readonly limit: number = 50,
  ) {}
}

