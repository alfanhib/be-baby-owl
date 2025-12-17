export class GetClassesQuery {
  constructor(
    public readonly courseId?: string,
    public readonly instructorId?: string,
    public readonly status?: string,
    public readonly type?: string,
    public readonly page?: number,
    public readonly limit?: number,
  ) {}
}

export class GetInstructorClassesQuery {
  constructor(
    public readonly instructorId: string,
    public readonly status?: string,
  ) {}
}

export class GetStudentClassesQuery {
  constructor(
    public readonly studentId: string,
    public readonly status?: string,
  ) {}
}
