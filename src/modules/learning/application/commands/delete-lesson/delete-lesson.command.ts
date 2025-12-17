export class DeleteLessonCommand {
  constructor(
    public readonly lessonId: string,
    public readonly courseId: string,
    public readonly sectionId: string,
    public readonly userId: string,
  ) {}
}
