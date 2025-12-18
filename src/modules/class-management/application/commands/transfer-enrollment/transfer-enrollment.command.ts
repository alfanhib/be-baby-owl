export class TransferEnrollmentCommand {
  constructor(
    public readonly enrollmentId: string,
    public readonly toClassId: string,
    public readonly reason: string,
    public readonly transferredById: string,
  ) {}
}
