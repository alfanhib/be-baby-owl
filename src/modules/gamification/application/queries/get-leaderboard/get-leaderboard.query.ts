export class GetLeaderboardQuery {
  constructor(
    public readonly limit: number = 10,
    public readonly offset: number = 0,
    public readonly period:
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'all_time' = 'weekly',
  ) {}
}
