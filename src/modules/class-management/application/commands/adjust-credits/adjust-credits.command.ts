export class AdjustCreditsCommand {
  constructor(
    public readonly classId: string,
    public readonly enrollmentId: string,
    public readonly amount: number, // positive = add, negative = deduct
    public readonly type: string, // 'addition' | 'deduction' | 'refund' | 'correction'
    public readonly reason: string,
    public readonly adjustedBy: string,
  ) {}
}
