export class GenerateCertificateCommand {
  constructor(
    public readonly userId: string,
    public readonly courseId: string,
  ) {}
}
