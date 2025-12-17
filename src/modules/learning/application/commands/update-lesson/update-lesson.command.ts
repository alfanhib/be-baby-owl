export class UpdateLessonCommand {
  constructor(
    public readonly lessonId: string,
    public readonly courseId: string,
    public readonly sectionId: string,
    public readonly title: string | undefined,
    public readonly description: string | undefined,
    public readonly estimatedDuration: number | undefined,
    public readonly userId: string,
  ) {}
}
