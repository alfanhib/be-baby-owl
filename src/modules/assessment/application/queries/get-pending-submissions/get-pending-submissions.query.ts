export class GetPendingSubmissionsQuery {
  constructor(
    public readonly instructorId: string,
    public readonly page: number = 1,
    public readonly limit: number = 10,
  ) {}
}
