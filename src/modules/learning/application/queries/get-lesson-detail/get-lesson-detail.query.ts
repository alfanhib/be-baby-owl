export class GetLessonDetailQuery {
  constructor(
    public readonly courseId: string,
    public readonly lessonId: string,
    public readonly userId?: string, // Optional: include user progress
  ) {}
}
