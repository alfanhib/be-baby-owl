export class MarkAttendanceCommand {
  constructor(
    public readonly classId: string,
    public readonly enrollmentId: string,
    public readonly meetingNumber: number,
    public readonly meetingDate: Date,
    public readonly status: string, // 'present' | 'absent' | 'late' | 'excused'
    public readonly markedBy: string,
    public readonly notes?: string,
  ) {}
}
