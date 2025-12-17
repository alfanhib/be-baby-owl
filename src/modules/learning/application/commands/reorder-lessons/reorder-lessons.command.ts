export class ReorderLessonsCommand {
  constructor(
    public readonly courseId: string,
    public readonly sectionId: string,
    public readonly lessonIds: string[],
    public readonly userId: string,
  ) {}
}
