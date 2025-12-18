export class QuickEnrollCommand {
  constructor(
    // Student info - either existing ID or new student data
    public readonly studentId: string | null,
    public readonly studentName: string | null,
    public readonly studentEmail: string | null,
    public readonly studentPhone: string | null,
    // Enrollment info
    public readonly classId: string,
    public readonly packageMeetings: number,
    public readonly packagePrice: number,
    public readonly paymentStatus: 'pending' | 'verified',
    public readonly notes: string | null,
    // Staff who created the enrollment
    public readonly enrolledById: string,
  ) {}
}
