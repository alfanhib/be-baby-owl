export class DeleteExerciseCommand {
  constructor(
    public readonly exerciseId: string,
    public readonly courseId: string,
    public readonly sectionId: string,
    public readonly lessonId: string,
    public readonly userId: string,
  ) {}
}
