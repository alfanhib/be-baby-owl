export class GetCourseStudentsQuery {
  constructor(
    public readonly courseId: string,
    public readonly search?: string,
    public readonly status?: string,
    public readonly classId?: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
  ) {}
}
