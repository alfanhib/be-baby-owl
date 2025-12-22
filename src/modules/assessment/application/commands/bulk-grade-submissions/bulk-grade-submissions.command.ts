export interface BulkGradeEntry {
  submissionId: string;
  score: number;
  maxScore: number;
  feedback?: string;
}

export class BulkGradeSubmissionsCommand {
  constructor(
    public readonly gradedById: string,
    public readonly entries: BulkGradeEntry[],
  ) {}
}

