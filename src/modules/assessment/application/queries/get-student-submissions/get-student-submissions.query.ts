export class GetStudentSubmissionsQuery {
  constructor(
    public readonly studentId: string,
    public readonly exerciseId?: string,
    public readonly status?: string,
    public readonly page: number = 1,
    public readonly limit: number = 10,
  ) {}
}

