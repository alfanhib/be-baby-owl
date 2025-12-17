export class AddSectionCommand {
  constructor(
    public readonly courseId: string,
    public readonly title: string,
    public readonly description: string | undefined,
    public readonly userId: string,
  ) {}
}
