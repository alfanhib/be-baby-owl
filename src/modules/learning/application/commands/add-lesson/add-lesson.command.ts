export class AddLessonCommand {
  constructor(
    public readonly courseId: string,
    public readonly sectionId: string,
    public readonly title: string,
    public readonly description: string | undefined,
    public readonly estimatedDuration: number | undefined,
    public readonly userId: string,
  ) {}
}
