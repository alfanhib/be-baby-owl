export class UpgradePackageCommand {
  constructor(
    public readonly enrollmentId: string,
    public readonly additionalMeetings: number,
    public readonly additionalAmount: number,
    public readonly paymentStatus: string,
    public readonly upgradedById: string,
  ) {}
}
