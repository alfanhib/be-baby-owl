export class UpdateCourseCommand {
  constructor(
    public readonly courseId: string,
    public readonly updatedById: string,
    public readonly title?: string,
    public readonly description?: string,
    public readonly coverImage?: string,
    public readonly category?: string,
    public readonly level?: string,
    public readonly language?: string,
    public readonly estimatedDuration?: number,
  ) {}
}
