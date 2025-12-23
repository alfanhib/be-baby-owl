export interface BulkAttendanceItem {
  enrollmentId: string;
  status: string; // 'present' | 'absent' | 'late'
  notes?: string;
}

export class BulkMarkAttendanceCommand {
  constructor(
    public readonly classId: string,
    public readonly meetingNumber: number,
    public readonly meetingDate: Date,
    public readonly attendances: BulkAttendanceItem[],
    public readonly markedBy: string,
  ) {}
}
