export class ExportPaymentsQuery {
  constructor(
    public readonly status?: string,
    public readonly method?: string,
    public readonly courseId?: string,
    public readonly search?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
  ) {}
}


