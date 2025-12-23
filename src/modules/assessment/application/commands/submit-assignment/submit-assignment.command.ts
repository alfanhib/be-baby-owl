export class SubmitAssignmentCommand {
  constructor(
    public readonly exerciseId: string,
    public readonly studentId: string,
    public readonly type: string,
    public readonly fileUrl?: string,
    public readonly fileName?: string,
    public readonly fileSize?: number,
    public readonly textContent?: string,
    public readonly linkUrl?: string,
    public readonly comment?: string,
  ) {}
}
