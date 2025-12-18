export class GetXpHistoryQuery {
  constructor(
    public readonly userId: string,
    public readonly limit: number = 20,
    public readonly offset: number = 0,
  ) {}
}
