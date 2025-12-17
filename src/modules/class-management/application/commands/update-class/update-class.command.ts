export class UpdateClassCommand {
  constructor(
    public readonly classId: string,
    public readonly name?: string,
    public readonly maxStudents?: number,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly enrollmentDeadline?: Date,
    public readonly notes?: string,
  ) {}
}
