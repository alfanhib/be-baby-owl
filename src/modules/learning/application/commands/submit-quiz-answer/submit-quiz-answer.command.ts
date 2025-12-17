export class SubmitQuizAnswerCommand {
  constructor(
    public readonly userId: string,
    public readonly courseId: string,
    public readonly lessonId: string,
    public readonly exerciseId: string,
    public readonly answers: Record<string, unknown>, // Quiz-specific answers
  ) {}
}
