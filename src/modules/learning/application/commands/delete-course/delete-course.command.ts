export class DeleteCourseCommand {
  constructor(
    public readonly courseId: string,
    public readonly deletedById: string,
  ) {}
}
