export class GetCourseDetailQuery {
  constructor(
    public readonly studentId: string,
    public readonly classId: string,
  ) {}
}
