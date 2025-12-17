export class UnlockLessonCommand {
  constructor(
    public readonly classId: string,
    public readonly lessonId: string,
    public readonly unlockedBy: string,
    public readonly meetingNumber?: number,
    public readonly notes?: string,
  ) {}
}
