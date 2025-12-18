export class UpdatePaymentCommand {
  constructor(
    public readonly paymentId: string,
    public readonly studentName?: string,
    public readonly studentEmail?: string,
    public readonly studentPhone?: string,
    public readonly courseId?: string,
    public readonly packageType?: string,
    public readonly amount?: number,
    public readonly method?: string,
    public readonly reference?: string,
    public readonly notes?: string,
    public readonly paidAt?: Date,
  ) {}
}
