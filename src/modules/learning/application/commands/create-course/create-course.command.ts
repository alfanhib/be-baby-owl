export class CreateCourseCommand {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly createdById: string,
    public readonly slug?: string,
    public readonly coverImage?: string,
    public readonly category?: string,
    public readonly level?: string,
    public readonly language?: string,
    public readonly estimatedDuration?: number,
  ) {}
}
