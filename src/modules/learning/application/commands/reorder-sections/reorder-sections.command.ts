export class ReorderSectionsCommand {
  constructor(
    public readonly courseId: string,
    public readonly sectionIds: string[],
    public readonly userId: string,
  ) {}
}
