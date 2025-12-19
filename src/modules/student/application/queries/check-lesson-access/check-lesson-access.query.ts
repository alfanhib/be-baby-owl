export class CheckLessonAccessQuery {
  constructor(
    public readonly studentId: string,
    public readonly classId: string,
    public readonly lessonId: string,
  ) {}
}
