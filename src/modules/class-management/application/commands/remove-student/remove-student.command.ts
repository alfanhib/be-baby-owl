export class RemoveStudentCommand {
  constructor(
    public readonly classId: string,
    public readonly studentId: string,
  ) {}
}
