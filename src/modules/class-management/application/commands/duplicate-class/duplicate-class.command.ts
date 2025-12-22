export class DuplicateClassCommand {
  constructor(
    public readonly sourceClassId: string,
    public readonly newName: string,
    public readonly newInstructorId?: string,
    public readonly newStartDate?: Date,
    public readonly newEndDate?: Date,
    public readonly newEnrollmentDeadline?: Date,
  ) {}
}


