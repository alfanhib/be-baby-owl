export class EnrollStudentCommand {
  constructor(
    public readonly classId: string,
    public readonly studentId: string,
    public readonly notes?: string,
  ) {}
}
