export class UploadProofCommand {
  constructor(
    public readonly paymentId: string,
    public readonly proofUrl: string,
  ) {}
}
