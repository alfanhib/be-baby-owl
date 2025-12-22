export class GetGradingStatsQuery {
  constructor(
    public readonly instructorId: string,
    public readonly classId?: string,
  ) {}
}

