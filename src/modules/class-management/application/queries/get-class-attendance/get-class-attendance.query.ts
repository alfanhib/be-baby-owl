export class GetClassAttendanceQuery {
  constructor(
    public readonly classId: string,
    public readonly meetingNumber?: number,
  ) {}
}

export class GetStudentAttendanceQuery {
  constructor(
    public readonly classId: string,
    public readonly studentId: string,
  ) {}
}
