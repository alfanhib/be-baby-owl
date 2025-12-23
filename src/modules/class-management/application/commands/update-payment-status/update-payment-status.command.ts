export class UpdatePaymentStatusCommand {
  constructor(
    public readonly enrollmentId: string,
    public readonly paymentStatus: string,
    public readonly verifiedById: string,
    public readonly verificationNotes?: string,
  ) {}
}
