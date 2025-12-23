export interface BulkEnrollStudentInput {
  name: string;
  email: string;
  phone?: string;
}

export class BulkEnrollCommand {
  constructor(
    public readonly classId: string,
    public readonly students: BulkEnrollStudentInput[],
    public readonly amount: number,
    public readonly paymentStatus: string,
    public readonly enrolledById: string,
  ) {}
}
