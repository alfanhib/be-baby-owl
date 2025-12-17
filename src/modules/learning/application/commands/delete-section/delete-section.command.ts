export class DeleteSectionCommand {
  constructor(
    public readonly sectionId: string,
    public readonly courseId: string,
    public readonly userId: string,
  ) {}
}
