export class UpdateSectionCommand {
  constructor(
    public readonly sectionId: string,
    public readonly courseId: string,
    public readonly title: string | undefined,
    public readonly description: string | undefined,
    public readonly userId: string,
  ) {}
}
