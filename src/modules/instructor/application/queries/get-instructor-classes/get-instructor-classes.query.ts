export class GetInstructorClassesQuery {
  constructor(
    public readonly instructorId: string,
    public readonly status?: string,
    public readonly courseId?: string,
  ) {}
}
