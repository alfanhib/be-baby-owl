export class VerifyPaymentCommand {
  constructor(
    public readonly paymentId: string,
    public readonly verifiedBy: string,
    public readonly notes?: string,
  ) {}
}
