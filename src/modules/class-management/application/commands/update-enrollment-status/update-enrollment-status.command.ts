export class UpdateEnrollmentStatusCommand {
  constructor(
    public readonly enrollmentId: string,
    public readonly status: string,
    public readonly updatedById: string,
  ) {}
}
