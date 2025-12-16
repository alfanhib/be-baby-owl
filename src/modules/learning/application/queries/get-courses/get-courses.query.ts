export class GetCoursesQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly status?: string,
    public readonly category?: string,
    public readonly level?: string,
    public readonly createdById?: string,
    public readonly search?: string,
  ) {}
}

export class GetPublishedCoursesQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly category?: string,
    public readonly level?: string,
    public readonly search?: string,
  ) {}
}
