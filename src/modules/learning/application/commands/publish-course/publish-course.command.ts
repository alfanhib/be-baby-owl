export class PublishCourseCommand {
  constructor(
    public readonly courseId: string,
    public readonly publishedById: string,
  ) {}
}
