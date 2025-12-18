export class CreatePaymentCommand {
  constructor(
    public readonly studentName?: string,
    public readonly studentEmail?: string,
    public readonly studentPhone?: string,
    public readonly courseId?: string,
    public readonly packageType?: string,
    public readonly amount?: number,
    public readonly method?: string,
    public readonly reference?: string,
    public readonly paidAt?: Date,
    public readonly notes?: string,
  ) {}
}
