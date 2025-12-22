export interface BulkEnrollStudent {
  email: string;
  name: string;
  phone?: string;
  packageMeetings: number;
  packagePrice: number;
  notes?: string;
}

export class BulkEnrollCommand {
  constructor(
    public readonly classId: string,
    public readonly students: BulkEnrollStudent[],
    public readonly paymentStatus: 'pending' | 'verified',
    public readonly enrolledById: string,
  ) {}
}
