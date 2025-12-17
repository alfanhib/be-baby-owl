export class ReorderExercisesCommand {
  constructor(
    public readonly courseId: string,
    public readonly sectionId: string,
    public readonly lessonId: string,
    public readonly exerciseIds: string[],
    public readonly userId: string,
  ) {}
}
