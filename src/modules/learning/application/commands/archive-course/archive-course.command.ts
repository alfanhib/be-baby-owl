export class ArchiveCourseCommand {
  constructor(
    public readonly courseId: string,
    public readonly archivedById: string,
  ) {}
}
