export class UpdateVideoProgressCommand {
  constructor(
    public readonly userId: string,
    public readonly courseId: string,
    public readonly lessonId: string,
    public readonly exerciseId: string,
    public readonly watchedSeconds: number,
    public readonly totalSeconds: number,
  ) {}
}
