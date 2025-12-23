export class ReturnForRevisionCommand {
  constructor(
    public readonly submissionId: string,
    public readonly returnedById: string,
    public readonly feedback: string,
  ) {}
}
