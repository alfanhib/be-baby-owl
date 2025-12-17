export class CreateClassCommand {
  constructor(
    public readonly name: string,
    public readonly courseId: string,
    public readonly instructorId: string,
    public readonly type: string, // 'group' | 'private'
    public readonly totalMeetings: number,
    public readonly maxStudents?: number,
    public readonly schedules?: Array<{
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      timezone?: string;
    }>,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly enrollmentDeadline?: Date,
    public readonly notes?: string,
  ) {}
}
