export class GetMyCoursesQuery {
  constructor(
    public readonly studentId: string,
    public readonly status?: 'active' | 'completed' | 'paused',
  ) {}
}
