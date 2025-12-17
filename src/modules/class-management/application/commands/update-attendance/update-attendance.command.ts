export class UpdateAttendanceCommand {
  constructor(
    public readonly attendanceId: string,
    public readonly status: string,
    public readonly editedBy: string,
    public readonly notes?: string,
  ) {}
}
