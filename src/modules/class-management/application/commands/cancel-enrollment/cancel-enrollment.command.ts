export class CancelEnrollmentCommand {
  constructor(
    public readonly enrollmentId: string,
    public readonly reason: string,
    public readonly refundAmount: number | null,
    public readonly cancelledById: string,
  ) {}
}
