export class GradeSubmissionCommand {
  constructor(
    public readonly submissionId: string,
    public readonly gradedById: string,
    public readonly score: number,
    public readonly maxScore: number,
    public readonly feedback?: string,
  ) {}
}
